import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFahrzeugeBrandings = () => {
  return useQuery({
    queryKey: ["brandings-fahrzeuge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brandings")
        .select("id, company_name, lawyer_name, slug")
        .eq("branding_type", "fahrzeuge")
        .eq("is_active", true)
        .order("company_name");

      if (error) throw error;
      return data || [];
    },
  });
};
