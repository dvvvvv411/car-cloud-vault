import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Lead {
  id: string;
  campaign_id: string;
  email: string;
  password: string;
  branding_id: string;
  has_logged_in: boolean;
  first_login_at: string | null;
  last_login_at: string | null;
  login_count: number;
  inquiry_id: string | null;
  created_at: string;
}

export interface LeadCampaign {
  id: string;
  branding_id: string;
  upload_date: string;
  campaign_name: string;
  total_leads: number;
  created_by: string | null;
  created_at: string;
  brandings?: {
    company_name: string;
    case_number: string;
  };
  logged_in_count?: number;
  inquiry_count?: number;
}

// Fetch all campaigns with stats
export const useLeadCampaigns = () => {
  return useQuery({
    queryKey: ["lead-campaigns"],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from("lead_campaigns")
        .select(`
          *,
          brandings (
            company_name,
            case_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch stats for each campaign
      const campaignsWithStats = await Promise.all(
        campaigns.map(async (campaign) => {
          // Get logged in count
          const { count: loggedInCount } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id)
            .eq("has_logged_in", true);

          // Get inquiry count
          const { count: inquiryCount } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id)
            .not("inquiry_id", "is", null);

          return {
            ...campaign,
            logged_in_count: loggedInCount || 0,
            inquiry_count: inquiryCount || 0,
          };
        })
      );

      return campaignsWithStats as LeadCampaign[];
    },
  });
};

// Fetch leads for a specific campaign
export const useCampaignLeads = (campaignId: string | null) => {
  return useQuery({
    queryKey: ["campaign-leads", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!campaignId,
  });
};

// Generate unique 8-character password (A-Z, 0-9)
const generateUniquePassword = (existingPasswords: Set<string>): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!existingPasswords.has(password)) {
      existingPasswords.add(password);
      return password;
    }
    attempts++;
  }

  throw new Error('Konnte kein einzigartiges Passwort generieren');
};

// Generate campaign name with auto-increment
const generateCampaignName = async (brandingId: string, date: Date): Promise<string> => {
  const baseDate = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Get all campaigns for this branding and date
  const { data: existingCampaigns, error } = await supabase
    .from("lead_campaigns")
    .select("campaign_name")
    .eq("branding_id", brandingId)
    .like("campaign_name", `${baseDate}%`);

  if (error) throw error;

  if (!existingCampaigns || existingCampaigns.length === 0) {
    return baseDate;
  }

  return `${baseDate} (${existingCampaigns.length + 1})`;
};

// Upload lead campaign
export const useUploadLeadCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, brandingId }: { file: File; brandingId: string }) => {
      // Read file
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = lines.filter(email => emailRegex.test(email.toLowerCase()));

      if (validEmails.length === 0) {
        throw new Error('Keine gültigen Emails in der Datei gefunden');
      }

      // Fetch all existing passwords to avoid duplicates
      const { data: existingLeads, error: fetchError } = await supabase
        .from("leads")
        .select("password, email, branding_id");

      if (fetchError) throw fetchError;

      const existingPasswords = new Set(existingLeads?.map(l => l.password) || []);
      const existingEmailsForBranding = new Set(
        existingLeads
          ?.filter(l => l.branding_id === brandingId)
          .map(l => l.email.toLowerCase()) || []
      );

      // Filter out duplicate emails for this branding
      const newEmails = validEmails.filter(
        email => !existingEmailsForBranding.has(email.toLowerCase())
      );
      const skippedEmails = validEmails.length - newEmails.length;

      if (newEmails.length === 0) {
        throw new Error('Alle Emails existieren bereits für dieses Branding');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Generate campaign name
      const campaignName = await generateCampaignName(brandingId, new Date());

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("lead_campaigns")
        .insert({
          branding_id: brandingId,
          campaign_name: campaignName,
          total_leads: newEmails.length,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Generate leads with unique passwords
      const leads = newEmails.map(email => ({
        campaign_id: campaign.id,
        email: email.toLowerCase(),
        password: generateUniquePassword(existingPasswords),
        branding_id: brandingId,
      }));

      // Insert leads
      const { error: leadsError } = await supabase
        .from("leads")
        .insert(leads);

      if (leadsError) throw leadsError;

      return {
        success: true,
        totalLeads: newEmails.length,
        skippedEmails,
        campaignName,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lead-campaigns"] });
      toast({
        title: "Leads erfolgreich importiert",
        description: `${data.totalLeads} Leads wurden importiert${
          data.skippedEmails > 0 ? ` (${data.skippedEmails} Duplikate übersprungen)` : ''
        }`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Import",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
