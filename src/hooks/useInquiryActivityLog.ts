import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "status_change" | "note_added";

export interface ActivityLogEntry {
  id: string;
  inquiry_id: string;
  activity_type: ActivityType;
  old_value: string | null;
  new_value: string | null;
  inquiry_name: string | null;
  performed_by: string | null;
  created_at: string;
  user_email: string | null;
}

export const useInquiryActivityLog = (limit = 50) => {
  return useQuery({
    queryKey: ["inquiry-activity-log", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiry_activity_log" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const entries = (data || []) as any[];

      const withEmails = await Promise.all(
        entries.map(async (entry) => {
          if (!entry.performed_by) return { ...entry, user_email: null };
          const { data: email } = await supabase.rpc("get_user_email", {
            user_id: entry.performed_by,
          });
          return { ...entry, user_email: email };
        })
      );

      return withEmails as ActivityLogEntry[];
    },
  });
};

export const logActivity = async (params: {
  inquiryId: string;
  activityType: ActivityType;
  oldValue?: string | null;
  newValue?: string | null;
  inquiryName?: string | null;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("inquiry_activity_log" as any).insert({
      inquiry_id: params.inquiryId,
      activity_type: params.activityType,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      inquiry_name: params.inquiryName ?? null,
      performed_by: user?.id ?? null,
    });
    if (error) console.warn("Activity log insert failed:", error);
  } catch (e) {
    console.warn("Activity log error:", e);
  }
};

export const useInvalidateActivityLog = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["inquiry-activity-log"] });
};
