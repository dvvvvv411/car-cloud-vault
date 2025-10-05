import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  selected_vehicles: Array<{
    chassis: string;
    brand: string;
    model: string;
    price: number;
    kilometers: number;
    first_registration: string;
  }>;
  total_price: number;
  status: string;
  created_at: string;
  brandings?: {
    company_name: string;
    case_number: string;
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
            case_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Inquiry[];
    },
  });
};
