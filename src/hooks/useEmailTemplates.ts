import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EmailTemplateType = 'single_male' | 'single_female' | 'multiple_male' | 'multiple_female';

export interface EmailTemplate {
  id: string;
  branding_id: string;
  template_type: EmailTemplateType;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

// Fetch all templates für ein Branding
export const useEmailTemplates = (brandingId?: string) => {
  return useQuery({
    queryKey: ['email-templates', brandingId],
    queryFn: async () => {
      let query = supabase
        .from('email_templates')
        .select('*')
        .order('template_type');

      if (brandingId) {
        query = query.eq('branding_id', brandingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!brandingId,
  });
};

// Update template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      subject,
      body,
    }: {
      id: string;
      subject: string;
      body: string;
    }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject,
          body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email-Template erfolgreich aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating email template:', error);
      toast.error('Fehler beim Aktualisieren des Email-Templates');
    },
  });
};
