import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface EmailTemplate {
  id: string;
  branding_id: string | null;
  template_type: 'single_male' | 'single_female' | 'multiple_male' | 'multiple_female';
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates' as any)
        .select('*')
        .is('branding_id', null)
        .order('template_type', { ascending: true });
      
      if (error) throw error;
      return data as unknown as EmailTemplate[];
    }
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, subject, body }: { id: string; subject: string; body: string }) => {
      const { error } = await supabase
        .from('email_templates' as any)
        .update({ subject, body, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: "Erfolgreich gespeichert",
        description: "Das Email Template wurde aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Template konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });
};
