import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InquiryStatus = "Neu" | "Möchte RG/KV" | "RG/KV gesendet" | "Bezahlt" | "Exchanged" | "Kein Interesse";

export interface Inquiry {
  id: string;
  branding_id: string | null;
  customer_type: string;
  company_name: string | null;
  first_name: string;
  last_name: string;
  street: string;
  zip_code: string;
  city: string;
  email: string;
  phone: string;
  message: string | null;
  lead_id: string | null;
  selected_vehicles: Array<{
    chassis: string;
    brand: string;
    model: string;
    price: number;
    kilometers: number;
    first_registration: string;
    report_nr: string;
  }>;
  total_price: number;
  status: InquiryStatus;
  status_updated_at?: string;
  call_priority: boolean;
  created_at: string;
  discount_percentage: number | null;
  discount_granted_at: string | null;
  discount_granted_by: string | null;
  brandings?: {
    company_name: string;
    case_number: string;
    lawyer_firm_name: string;
  } | null;
}

export const useInquiries = () => {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select(`
          *,
          brandings (
            company_name,
            case_number,
            lawyer_firm_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        selected_vehicles: Array.isArray(item.selected_vehicles) 
          ? item.selected_vehicles 
          : [],
        call_priority: item.call_priority ?? false
      })) as Inquiry[];
    },
  });
};

export const useUpdateInquiryCallPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, callPriority }: { inquiryId: string; callPriority: boolean }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ call_priority: callPriority })
        .eq("id", inquiryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
};
