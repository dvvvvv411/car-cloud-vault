import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface LeadReservation {
  id: string;
  lead_id: string;
  vehicle_chassis: string;
  reserved_at: string;
  reserved_by: string | null;
}

// Hook für Admins: Reservierungen für einen Lead abrufen
export const useLeadReservations = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead-reservations", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("lead_reserved_vehicles")
        .select("*")
        .eq("lead_id", leadId);
      
      if (error) throw error;
      return data as LeadReservation[];
    },
    enabled: !!leadId,
  });
};

// Hook für Admins: Reservierungen hinzufügen
export const useAddReservations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      leadId, 
      chassisNumbers 
    }: { 
      leadId: string; 
      chassisNumbers: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const reservations = chassisNumbers.map(chassis => ({
        lead_id: leadId,
        vehicle_chassis: chassis.trim().toUpperCase(),
        reserved_by: user?.id || null,
      }));
      
      const { error } = await supabase
        .from("lead_reserved_vehicles")
        .insert(reservations);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-reservations"] });
      toast({
        title: "Reservierungen hinzugefügt",
        description: "Die Fahrzeuge wurden erfolgreich reserviert",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook für Admins: Reservierung entfernen
export const useRemoveReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reservationId }: { reservationId: string }) => {
      const { error } = await supabase
        .from("lead_reserved_vehicles")
        .delete()
        .eq("id", reservationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-reservations"] });
      toast({
        title: "Reservierung entfernt",
        description: "Die Fahrzeug-Reservierung wurde entfernt",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook für Frontend: Reservierungen für aktuellen Lead abrufen
export const useMyReservations = (leadId: string | null) => {
  return useQuery({
    queryKey: ["my-reservations", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("lead_reserved_vehicles")
        .select("*")
        .eq("lead_id", leadId);
      
      if (error) throw error;
      return data as LeadReservation[];
    },
    enabled: !!leadId,
  });
};
