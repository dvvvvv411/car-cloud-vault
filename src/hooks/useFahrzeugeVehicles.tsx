import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Equipment
  garantie?: string | null;
  highlights?: string[] | null;
  assistenzsysteme?: string[] | null;
  multimedia?: string[] | null;
  technik_sicherheit?: string[] | null;
  interieur?: string[] | null;
  exterieur?: string[] | null;
  sonstiges?: string[] | null;
  
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
        highlights: vehicle.highlights as string[] | null,
        assistenzsysteme: vehicle.assistenzsysteme as string[] | null,
        multimedia: vehicle.multimedia as string[] | null,
        technik_sicherheit: vehicle.technik_sicherheit as string[] | null,
        interieur: vehicle.interieur as string[] | null,
        exterieur: vehicle.exterieur as string[] | null,
        sonstiges: vehicle.sonstiges as string[] | null,
        branding_ids: (vehicle.fahrzeuge_vehicle_brandings as any[] || []).map((b: any) => b.branding_id),
      })) as FahrzeugeVehicle[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
