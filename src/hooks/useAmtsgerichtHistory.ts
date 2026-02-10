import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AmtsgerichtHistoryEntry {
  id: string;
  inquiry_id: string;
  old_status: string;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
  inquiry_name: string | null;
}

export const useAmtsgerichtHistory = () => {
  return useQuery({
    queryKey: ["amtsgericht-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("amtsgericht_status_history")
        .select("*")
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data as AmtsgerichtHistoryEntry[];
    },
  });
};

export const useLogAmtsgerichtStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inquiryId,
      oldStatus,
      newStatus,
      inquiryName,
    }: {
      inquiryId: string;
      oldStatus: string;
      newStatus: string;
      inquiryName: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("amtsgericht_status_history")
        .insert({
          inquiry_id: inquiryId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: user?.id || null,
          inquiry_name: inquiryName,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amtsgericht-history"] });
    },
  });
};
