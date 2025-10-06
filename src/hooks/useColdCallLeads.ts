import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ColdCallLead {
  id: string;
  campaign_id: string;
  company_name: string;
  phone_number: string;
  email: string | null;
  status: 'active' | 'invalid' | 'mailbox' | 'interested' | 'not_interested';
  mailbox_timestamp?: string | null;
  invalid_timestamp?: string | null;
  not_interested_timestamp?: string | null;
  interested_timestamp?: string | null;
  created_at: string;
  updated_at: string;
}

export const useCampaignLeads = (campaignId: string) => {
  return useQuery({
    queryKey: ['cold-call-leads', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cold_call_leads')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ColdCallLead[];
    },
    enabled: !!campaignId,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      status,
      campaignId,
    }: { 
      leadId: string; 
      status: 'active' | 'invalid' | 'mailbox' | 'interested' | 'not_interested';
      campaignId: string;
    }) => {
      // Prepare update data
      const updateData: any = { status };
      
      // Set timestamp for status changes
      if (status === 'invalid') {
        updateData.invalid_timestamp = new Date().toISOString();
      }
      if (status === 'not_interested') {
        updateData.not_interested_timestamp = new Date().toISOString();
      }
      if (status === 'interested') {
        updateData.interested_timestamp = new Date().toISOString();
      }
      if (status === 'mailbox') {
        updateData.mailbox_timestamp = new Date().toISOString();
      }
      
      // Clear all timestamps when status is reset to active
      if (status === 'active') {
        updateData.invalid_timestamp = null;
        updateData.not_interested_timestamp = null;
        updateData.interested_timestamp = null;
        updateData.mailbox_timestamp = null;
      }
      
      const { error } = await supabase
        .from('cold_call_leads')
        .update(updateData)
        .eq('id', leadId);
      
      if (error) throw error;
      
      // Update campaign statistics
      const { data: leads } = await supabase
        .from('cold_call_leads')
        .select('status')
        .eq('campaign_id', campaignId);
      
      if (leads) {
        const invalidCount = leads.filter(l => l.status === 'invalid').length;
        const mailboxCount = leads.filter(l => l.status === 'mailbox').length;
        const interestedCount = leads.filter(l => l.status === 'interested').length;
        const notInterestedCount = leads.filter(l => l.status === 'not_interested').length;
        
        await supabase
          .from('cold_call_campaigns')
          .update({
            invalid_count: invalidCount,
            mailbox_count: mailboxCount,
            interested_count: interestedCount,
            not_interested_count: notInterestedCount,
          })
          .eq('id', campaignId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cold-call-leads', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['cold-call-campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Aktualisieren',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateLeadEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      email,
      campaignId,
    }: { 
      leadId: string; 
      email: string;
      campaignId: string;
    }) => {
      const { error } = await supabase
        .from('cold_call_leads')
        .update({ email })
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cold-call-leads', variables.campaignId] });
      toast({
        title: 'E-Mail gespeichert',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Helper function to generate unique password
const generateUniquePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper function to find or create "Kaltaquise" campaign
const findOrCreateKaltaquiseCampaign = async (brandingId: string) => {
  // Check if Kaltaquise campaign already exists for this branding
  const { data: existing } = await supabase
    .from('lead_campaigns')
    .select('*')
    .eq('branding_id', brandingId)
    .eq('campaign_name', 'Kaltaquise')
    .maybeSingle();
  
  if (existing) return existing;
  
  // Create new Kaltaquise campaign
  const { data: newCampaign, error } = await supabase
    .from('lead_campaigns')
    .insert({
      branding_id: brandingId,
      campaign_name: 'Kaltaquise',
      total_leads: 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return newCampaign;
};

export const useConvertLeadToRegularLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      coldCallLeadId,
      email,
      coldCallCampaignId,
      brandingId,
      callerId,
    }: { 
      coldCallLeadId: string;
      email: string;
      coldCallCampaignId: string;
      brandingId: string;
      callerId: string;
    }) => {
      // 1. Find or create Kaltaquise campaign
      const kaltaquiseCampaign = await findOrCreateKaltaquiseCampaign(brandingId);
      
      // 2. Generate unique password
      const password = generateUniquePassword();
      
      // 3. Create new lead in leads table
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          campaign_id: kaltaquiseCampaign.id,
          email: email.toLowerCase(),
          password: password,
          branding_id: brandingId,
        })
        .select()
        .single();
      
      if (leadError) throw leadError;
      
      // 4. Update cold call lead status to 'interested'
      const updateData: any = { 
        status: 'interested',
        interested_timestamp: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('cold_call_leads')
        .update(updateData)
        .eq('id', coldCallLeadId);
      
      if (updateError) throw updateError;
      
      // 5. Update cold call campaign statistics
      const { data: coldCallLeads } = await supabase
        .from('cold_call_leads')
        .select('status')
        .eq('campaign_id', coldCallCampaignId);
      
      if (coldCallLeads) {
        const invalidCount = coldCallLeads.filter(l => l.status === 'invalid').length;
        const mailboxCount = coldCallLeads.filter(l => l.status === 'mailbox').length;
        const interestedCount = coldCallLeads.filter(l => l.status === 'interested').length;
        const notInterestedCount = coldCallLeads.filter(l => l.status === 'not_interested').length;
        
        await supabase
          .from('cold_call_campaigns')
          .update({
            invalid_count: invalidCount,
            mailbox_count: mailboxCount,
            interested_count: interestedCount,
            not_interested_count: notInterestedCount,
          })
          .eq('id', coldCallCampaignId);
      }
      
      // 6. Update Kaltaquise campaign total_leads count
      const { data: kaltaquiseLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('campaign_id', kaltaquiseCampaign.id);
      
      if (kaltaquiseLeads) {
        await supabase
          .from('lead_campaigns')
          .update({ total_leads: kaltaquiseLeads.length })
          .eq('id', kaltaquiseCampaign.id);
      }
      
      // 7. Send email notification via edge function
      try {
        await supabase.functions.invoke('send-cold-call-interest-email', {
          body: {
            coldCallLeadId,
            email: email.toLowerCase(),
            password,
            brandingId,
            callerId,
          },
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw - lead conversion was successful even if email fails
      }
      
      return { newLead, password };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cold-call-leads'] });
      queryClient.invalidateQueries({ queryKey: ['cold-call-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['lead-campaigns'] });
      toast({
        title: 'Lead erfolgreich konvertiert',
        description: `Lead wurde zur Kaltaquise-Kampagne hinzugefügt. Passwort: ${data.password}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Konvertieren',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
