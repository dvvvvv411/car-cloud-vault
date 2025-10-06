import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ColdCallCaller {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  created_by: string | null;
}

export const useCallers = () => {
  return useQuery({
    queryKey: ['cold-call-callers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cold_call_callers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ColdCallCaller[];
    },
  });
};

export const useCreateCaller = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('cold_call_callers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cold-call-callers'] });
      toast({
        title: 'Caller erfolgreich erstellt',
        description: 'Der Caller wurde zur Liste hinzugefügt.',
      });
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
