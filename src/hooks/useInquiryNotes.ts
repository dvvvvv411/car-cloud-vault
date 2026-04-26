import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InquiryStatus } from "./useInquiries";
import { logActivity } from "./useInquiryActivityLog";

const fetchInquiryName = async (inquiryId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("inquiries")
    .select("first_name, last_name")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!data) return null;
  return `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null;
};

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

      const inquiryName = await fetchInquiryName(inquiryId);
      await logActivity({
        inquiryId,
        activityType: "note_added",
        newValue: noteText.length > 100 ? noteText.slice(0, 100) + "…" : noteText,
        oldValue: noteType === 'mailbox' ? 'mailbox' : 'note',
        inquiryName,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inquiry-notes", variables.inquiryId] });
      queryClient.invalidateQueries({ queryKey: ["inquiry-activity-log"] });
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
    mutationFn: async ({ inquiryId, status, oldStatus }: { inquiryId: string; status: InquiryStatus; oldStatus?: InquiryStatus }) => {
      let previousStatus = oldStatus;
      if (!previousStatus) {
        const { data: existing } = await supabase
          .from("inquiries")
          .select("status")
          .eq("id", inquiryId)
          .maybeSingle();
        previousStatus = existing?.status as InquiryStatus | undefined;
      }

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

      if (previousStatus && previousStatus !== status) {
        const inquiryName = await fetchInquiryName(inquiryId);
        await logActivity({
          inquiryId,
          activityType: "status_change",
          oldValue: previousStatus,
          newValue: status,
          inquiryName,
        });
      }

      // Trigger SMS when status changes TO "RG/KV gesendet" (only on transition)
      if (status === "RG/KV gesendet" && previousStatus !== "RG/KV gesendet") {
        supabase.functions
          .invoke("send-documents-sent-sms", { body: { inquiryId } })
          .then(({ error: smsError }) => {
            if (smsError) console.error("[docs-sms] invoke error:", smsError);
          })
          .catch((e) => console.error("[docs-sms] invoke threw:", e));
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiry-activity-log"] });
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
