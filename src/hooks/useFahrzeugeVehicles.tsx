import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AusstattungSection {
  id: string;
  title: string;
  content: string;
}

export interface FahrzeugeVehicle {
  id: string;
  brand: string;
  model: string;
  fin: string;
  
  // Technical data
  leistung_kw?: number | null;
  leistung_ps?: number | null;
  laufleistung: number;
  erstzulassung: string;
  motor_antrieb?: string | null;
  farbe?: string | null;
  innenausstattung?: string | null;
  tueren?: number | null;
  sitze?: number | null;
  hubraum?: string | null;
  
  // Price
  preis: number;
  
  // Dynamic equipment sections
  ausstattung_sections?: AusstattungSection[] | null;
  
  // Images
  vehicle_photos: string[] | null;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Multi-Branding
  branding_ids?: string[];
}

export const useFahrzeugeVehicles = () => {
  return useQuery({
    queryKey: ["fahrzeuge-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fahrzeuge_vehicles")
        .select(`
          *,
          fahrzeuge_vehicle_brandings(branding_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(vehicle => ({
        ...vehicle,
        ausstattung_sections: (vehicle.ausstattung_sections as unknown as AusstattungSection[]) || null,
        branding_ids: (vehicle.fahrzeuge_vehicle_brandings as any[] || []).map((b: any) => b.branding_id),
      })) as FahrzeugeVehicle[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
