import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Liefert das `inquiries_visible_from` Datum des aktuell eingeloggten Users.
 * Wenn nicht gesetzt → null (= alle Anfragen sichtbar).
 */
export const useCurrentUserVisibleFrom = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-user-visible-from", user?.id],
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("inquiries_visible_from")
        .eq("user_id", user.id)
        .order("inquiries_visible_from", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to load inquiries_visible_from", error);
        return null;
      }
      return (data?.inquiries_visible_from as string | null) ?? null;
    },
  });
};
