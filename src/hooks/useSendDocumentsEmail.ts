import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendDocumentsEmailParams {
  inquiryId: string;
  brandingId: string;
  documents: {
    rechnung: { base64: string; filename: string };
    kaufvertrag: { base64: string; filename: string };
    treuhandvertrag: { base64: string; filename: string };
  };
}

export const useSendDocumentsEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendDocumentsEmailParams) => {
      const { data, error } = await supabase.functions.invoke(
        "send-documents-email",
        {
          body: params,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Email erfolgreich versendet und Status aktualisiert!");
    },
    onError: (error: any) => {
      console.error("Email sending error:", error);
      toast.error(error.message || "Fehler beim Email-Versand");
    },
  });
};
