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
      let smsResult: { sent: boolean; reason?: string; error?: string } | null = null;
      if (status === "RG/KV gesendet" && previousStatus !== "RG/KV gesendet") {
        try {
          const { data: smsData, error: smsError } = await supabase.functions.invoke(
            "send-documents-sent-sms",
            { body: { inquiryId } }
          );
          if (smsError) {
            console.error("[docs-sms] invoke error:", smsError);
            smsResult = { sent: false, error: smsError.message || "invoke_error" };
          } else if (smsData?.success) {
            smsResult = { sent: true };
          } else {
            smsResult = {
              sent: false,
              reason: smsData?.reason,
              error: smsData?.error,
            };
          }
        } catch (e: any) {
          console.error("[docs-sms] invoke threw:", e);
          smsResult = { sent: false, error: e?.message || "invoke_threw" };
        }
      }

      // Trigger Telegram notifications on status transitions
      if (previousStatus !== status) {
        const tgEventMap: Record<string, string> = {
          "Möchte RG/KV": "moechte_rgkv",
          "RG/KV gesendet": "rgkv_sent",
          "Amtsgericht Ready": "amtsgericht_ready",
        };
        const eventType = tgEventMap[status as string];
        if (eventType) {
          supabase.functions
            .invoke("send-telegram-notification", {
              body: { inquiryId, eventType },
            })
            .then(({ error: tgError }) => {
              if (tgError) console.error("[telegram] invoke error:", tgError);
            })
            .catch((e) => console.error("[telegram] invoke threw:", e));
        }
      }

      return { data, smsResult };
    },
    onSuccess: ({ smsResult }) => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["inquiry-activity-log"] });

      if (smsResult) {
        if (smsResult.sent) {
          toast({
            title: "Status aktualisiert",
            description: "Status geändert und SMS an Kunden versendet.",
          });
        } else {
          const reasonMap: Record<string, string> = {
            sms_not_configured: "SMS im Branding nicht konfiguriert (Seven.io API-Key oder Absendername fehlt).",
            invalid_phone: "Telefonnummer des Kunden ist ungültig.",
            no_branding: "Anfrage hat kein Branding zugewiesen.",
            branding_not_found: "Branding nicht gefunden.",
            inquiry_not_found: "Anfrage nicht gefunden.",
          };
          const desc =
            (smsResult.reason && reasonMap[smsResult.reason]) ||
            smsResult.error ||
            "Unbekannter Fehler beim SMS-Versand.";
          toast({
            title: "Status geändert – SMS NICHT versendet",
            description: desc,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Status aktualisiert",
          description: "Der Status wurde erfolgreich geändert.",
        });
      }
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
