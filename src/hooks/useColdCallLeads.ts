import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ColdCallLead {
  id: string;
  campaign_id: string;
  company_name: string;
  phone_number: string;
  email: string | null;
  status: 'active' | 'invalid' | 'mailbox' | 'interested';
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
      status: 'invalid' | 'mailbox' | 'interested';
      campaignId: string;
    }) => {
      const { error } = await supabase
        .from('cold_call_leads')
        .update({ status })
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
        
        await supabase
          .from('cold_call_campaigns')
          .update({
            invalid_count: invalidCount,
            mailbox_count: mailboxCount,
            interested_count: interestedCount,
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
