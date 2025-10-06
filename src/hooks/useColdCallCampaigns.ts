import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ColdCallCampaign {
  id: string;
  caller_id: string;
  branding_id: string;
  upload_date: string;
  campaign_date: string;
  total_leads: number;
  invalid_count: number;
  mailbox_count: number;
  interested_count: number;
  not_interested_count: number;
  created_at: string;
  brandings?: {
    company_name: string;
  };
}

export const useCallerCampaigns = (callerId: string) => {
  return useQuery({
    queryKey: ['cold-call-campaigns', callerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cold_call_campaigns')
        .select('*, brandings(company_name)')
        .eq('caller_id', callerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ColdCallCampaign[];
    },
    enabled: !!callerId,
  });
};

export const useUploadColdCallCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      callerId, 
      brandingId, 
      file 
    }: { 
      callerId: string; 
      brandingId: string; 
      file: File;
    }) => {
      // Parse txt file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const leads: { company_name: string; phone_number: string }[] = [];
      
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length !== 2) {
          throw new Error(`Ungültiges Format in Zeile: ${line}`);
        }
        
        const companyName = parts[0].trim();
        const phoneNumber = parts[1].trim();
        
        if (!phoneNumber.match(/\d/)) {
          throw new Error(`Telefonnummer muss Zahlen enthalten: ${phoneNumber}`);
        }
        
        leads.push({ company_name: companyName, phone_number: phoneNumber });
      }
      
      if (leads.length === 0) {
        throw new Error('Die Datei enthält keine gültigen Leads');
      }
      
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('cold_call_campaigns')
        .insert({
          caller_id: callerId,
          branding_id: brandingId,
          campaign_date: new Date().toISOString().split('T')[0],
          total_leads: leads.length,
        })
        .select()
        .single();
      
      if (campaignError) throw campaignError;
      
      // Batch insert leads
      const leadsToInsert = leads.map(lead => ({
        campaign_id: campaign.id,
        company_name: lead.company_name,
        phone_number: lead.phone_number,
      }));
      
      const { error: leadsError } = await supabase
        .from('cold_call_leads')
        .insert(leadsToInsert);
      
      if (leadsError) throw leadsError;
      
      return campaign;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cold-call-campaigns', variables.callerId] });
      toast({
        title: 'Kampagne erfolgreich erstellt',
        description: 'Die Leads wurden hochgeladen.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
