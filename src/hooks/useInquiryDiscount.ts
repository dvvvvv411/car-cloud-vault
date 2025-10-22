import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateDiscountParams {
  inquiryId: string;
  discountPercentage: number;
}

export const useUpdateInquiryDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, discountPercentage }: UpdateDiscountParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("inquiries")
        .update({
          discount_percentage: discountPercentage,
          discount_granted_at: new Date().toISOString(),
          discount_granted_by: user?.id,
        })
        .eq("id", inquiryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Rabatt wurde gespeichert");
    },
    onError: (error) => {
      console.error("Error updating discount:", error);
      toast.error("Fehler beim Speichern des Rabatts");
    },
  });
};
