import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: UserRole;
  inquiries_visible_from: string | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data as User[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      role 
    }: { 
      email: string; 
      password: string; 
      role: UserRole;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { email, password, role },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Benutzer erfolgreich erstellt',
        description: 'Der neue Benutzer wurde angelegt.',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      toast({
        title: 'Fehler beim Erstellen',
        description: error.message || 'Der Benutzer konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      newPassword 
    }: { 
      userId: string; 
      newPassword: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, newPassword },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Passwort geändert',
        description: 'Das Passwort wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating password:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Das Passwort konnte nicht geändert werden.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUserVisibleFrom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      visibleFrom,
    }: {
      userId: string;
      visibleFrom: string | null;
    }) => {
      // Stelle sicher, dass eine user_roles-Zeile existiert (Trigger handle_new_user
      // erzeugt diese normalerweise schon bei Registrierung).
      const { data: existing, error: selectError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update({ inquiries_visible_from: visibleFrom })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "user", inquiries_visible_from: visibleFrom });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-visible-from"] });
      toast({
        title: "Sichtbarkeit aktualisiert",
        description: "Das Datum für sichtbare Anfragen wurde gespeichert.",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating visible_from:", error);
      toast({
        title: "Fehler",
        description: error.message || "Die Sichtbarkeit konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};
