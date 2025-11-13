import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateCustomerInfoParams {
  inquiryId: string;
  salutation: 'Herr' | 'Frau';
  customerType: "private" | "business";
  companyName?: string;
  firstName: string;
  lastName: string;
  street: string;
  zipCode: string;
  city: string;
  email: string;
  phone: string;
}

export const useUpdateInquiryCustomerInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inquiryId,
      salutation,
      customerType,
      companyName,
      firstName,
      lastName,
      street,
      zipCode,
      city,
      email,
      phone,
    }: UpdateCustomerInfoParams) => {
      const { error } = await supabase
        .from("inquiries")
        .update({
          salutation: salutation,
          customer_type: customerType,
          company_name: companyName,
          first_name: firstName,
          last_name: lastName,
          street: street,
          zip_code: zipCode,
          city: city,
          email: email,
          phone: phone,
        })
        .eq("id", inquiryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Kundeninformationen erfolgreich aktualisiert");
    },
    onError: (error) => {
      console.error("Error updating customer info:", error);
      toast.error("Fehler beim Aktualisieren der Kundeninformationen");
    },
  });
};
