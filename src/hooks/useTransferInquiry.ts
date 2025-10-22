import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransferInquiryParams {
  inquiryId: string;
}

export const useTransferInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId }: TransferInquiryParams) => {
      const { data, error } = await supabase.functions.invoke('create-bestellung-api', {
        body: { inquiryId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Anfrage erfolgreich übertragen");
    },
    onError: (error) => {
      console.error("Transfer error:", error);
      toast.error("Fehler beim Übertragen der Anfrage");
    },
  });
};
