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

      // Fetch all leads in batches to avoid 1000 row limit
      let allLeads: Lead[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allLeads = [...allLeads, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      return allLeads as Lead[];
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

// Helper: Find or create Quick-Send campaign for a branding
async function findOrCreateQuickSendCampaign(brandingId: string, brandingName: string) {
  const campaignName = `Schnell-Versand ${brandingName}`;
  
  // Try to find existing Quick-Send campaign
  const { data: existingCampaign } = await supabase
    .from('lead_campaigns')
    .select('*')
    .eq('branding_id', brandingId)
    .eq('campaign_name', campaignName)
    .maybeSingle();
  
  if (existingCampaign) {
    return existingCampaign;
  }
  
  // Create new Quick-Send campaign
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: newCampaign, error } = await supabase
    .from('lead_campaigns')
    .insert({
      branding_id: brandingId,
      campaign_name: campaignName,
      total_leads: 0,
      created_by: user?.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  return newCampaign;
}

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
      let campaignId: string | null = null;
      
      try {
        // Read file
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Validate emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = lines.filter(email => emailRegex.test(email.toLowerCase()));

        if (validEmails.length === 0) {
          throw new Error('Keine gültigen Emails in der Datei gefunden');
        }

        // Fetch all existing passwords and emails (case-insensitive)
        const { data: existingLeads, error: fetchError } = await supabase
          .from("leads")
          .select("password, email, branding_id");

        if (fetchError) throw fetchError;

        const existingPasswords = new Set(existingLeads?.map(l => l.password) || []);
        
        // Create case-insensitive email set for this branding
        const existingEmailsForBranding = new Set(
          existingLeads
            ?.filter(l => l.branding_id === brandingId)
            .map(l => l.email.toLowerCase()) || []
        );

        // Remove duplicates: both against DB and within file
        const uniqueValidEmails = Array.from(new Set(validEmails.map(e => e.toLowerCase())));
        const duplicatesInFile = validEmails.length - uniqueValidEmails.length;
        
        // Filter out emails that already exist in DB
        const newEmails = uniqueValidEmails.filter(
          email => !existingEmailsForBranding.has(email)
        );
        
        const skippedDuplicates = uniqueValidEmails.length - newEmails.length;

        if (newEmails.length === 0) {
          throw new Error('Alle Emails existieren bereits für dieses Branding');
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Generate campaign name
        const campaignName = await generateCampaignName(brandingId, new Date());

        // Create campaign FIRST (to get ID)
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
        campaignId = campaign.id;

        // Generate leads with unique passwords
        const leads = newEmails.map(email => ({
          campaign_id: campaign.id,
          email: email,
          password: generateUniquePassword(existingPasswords),
          branding_id: brandingId,
        }));

        // Insert leads - THIS MIGHT FAIL
        const { error: leadsError } = await supabase
          .from("leads")
          .insert(leads);

        if (leadsError) {
          // CRITICAL: Delete the campaign if lead insert fails
          await supabase
            .from("lead_campaigns")
            .delete()
            .eq("id", campaignId);
          
          throw new Error(`Lead-Import fehlgeschlagen: ${leadsError.message}. Kampagne wurde zurückgerollt.`);
        }

        return {
          success: true,
          totalLeads: newEmails.length,
          skippedDuplicates,
          duplicatesInFile,
          campaignName,
        };
      } catch (error) {
        // If campaign was created but something failed, try to delete it
        if (campaignId) {
          try {
            await supabase
              .from("lead_campaigns")
              .delete()
              .eq("id", campaignId);
          } catch (deleteError) {
            console.error("Failed to rollback campaign:", deleteError);
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lead-campaigns"] });
      toast({
        title: "Leads erfolgreich importiert",
        description: `${data.totalLeads} Leads wurden importiert${
          data.skippedDuplicates > 0 || data.duplicatesInFile > 0
            ? ` (${data.skippedDuplicates > 0 ? `${data.skippedDuplicates} bereits in DB` : ''}${data.skippedDuplicates > 0 && data.duplicatesInFile > 0 ? ', ' : ''}${data.duplicatesInFile > 0 ? `${data.duplicatesInFile} Duplikate in Datei` : ''})` 
            : ''
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

// Quick-Send Lead (single lead with email)
export const useQuickSendLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      email,
      brandingId,
      callerId,
    }: { 
      email: string;
      brandingId: string;
      callerId: string;
    }) => {
      // 1. Get branding name for campaign name
      const { data: branding, error: brandingError } = await supabase
        .from('brandings')
        .select('company_name')
        .eq('id', brandingId)
        .single();
      
      if (brandingError || !branding) {
        throw new Error('Branding nicht gefunden');
      }
      
      // 2. Find or create Quick-Send campaign
      const quickSendCampaign = await findOrCreateQuickSendCampaign(
        brandingId, 
        branding.company_name
      );
      
      // 3. Check for duplicate email in this campaign
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('campaign_id', quickSendCampaign.id)
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (existingLead) {
        throw new Error('Diese E-Mail wurde bereits in dieser Kampagne hinzugefügt');
      }
      
      // 4. Get existing passwords to avoid duplicates
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('password');
      
      const existingPasswords = new Set(existingLeads?.map(l => l.password) || []);
      
      // 5. Generate unique password
      const password = generateUniquePassword(existingPasswords);
      
      // 6. Create new lead
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          campaign_id: quickSendCampaign.id,
          email: email.toLowerCase(),
          password: password,
          branding_id: brandingId,
        })
        .select()
        .single();
      
      if (leadError) throw leadError;
      
      // 7. Update campaign total_leads count
      const { data: campaignLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('campaign_id', quickSendCampaign.id);
      
      if (campaignLeads) {
        await supabase
          .from('lead_campaigns')
          .update({ total_leads: campaignLeads.length })
          .eq('id', quickSendCampaign.id);
      }
      
      // 8. Send email notification via Edge Function
      let emailStatus: 'sent' | 'failed' = 'failed';
      try {
        const { data: emailResponse, error: invokeError } = await supabase.functions.invoke(
          'send-quick-send-email',
          {
            body: {
              leadId: newLead.id,
              email: email.toLowerCase(),
              password,
              brandingId,
              callerId,
            },
          }
        );
        
        if (invokeError || !emailResponse?.success) {
          console.error('Email invoke error:', invokeError);
          throw new Error('E-Mail konnte nicht versendet werden');
        }
        
        emailStatus = 'sent';
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw - lead creation was successful
      }
      
      return { newLead, password, emailStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads'] });
      
      if (data.emailStatus === 'sent') {
        toast({
          title: 'Lead erfolgreich erstellt',
          description: `E-Mail wurde versendet. Passwort: ${data.password}`,
        });
      } else {
        toast({
          title: 'Lead erstellt, aber E-Mail-Versand fehlgeschlagen',
          description: `Passwort: ${data.password} (bitte manuell weitergeben)`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Erstellen',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
