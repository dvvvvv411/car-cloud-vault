import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InquiryStatus } from "./useInquiries";

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  note_text: string;
  note_type: 'note' | 'mailbox';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user_email: string | null;
}

export const useInquiryNotes = (inquiryId: string) => {
  return useQuery({
    queryKey: ["inquiry-notes", inquiryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiry_notes")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch user emails for each note using the database function
      const notesWithEmails = await Promise.all(
        (data || []).map(async (note) => {
          if (!note.created_by) {
            return { ...note, user_email: null };
          }
          
          const { data: email } = await supabase.rpc('get_user_email', {
            user_id: note.created_by
          });
          
          return { ...note, user_email: email };
        })
      );
      
      return notesWithEmails as InquiryNote[];
    },
  });
};

export const useCreateInquiryNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, noteText, noteType = 'note' }: { inquiryId: string; noteText: string; noteType?: 'note' | 'mailbox' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("inquiry_notes")
        .insert({
          inquiry_id: inquiryId,
          note_text: noteText,
          note_type: noteType,
          created_by: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inquiry-notes", variables.inquiryId] });
      toast({
        title: "Notiz hinzugefügt",
        description: "Die Notiz wurde erfolgreich gespeichert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Notiz konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, status }: { inquiryId: string; status: InquiryStatus }) => {
      const { data, error } = await supabase
        .from("inquiries")
        .update({ 
          status,
          status_updated_at: new Date().toISOString()
        })
        .eq("id", inquiryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Status aktualisiert",
        description: "Der Status wurde erfolgreich geändert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};
