import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  chassis: string;
  report_nr: string;
  first_registration: string;
  kilometers: number;
  price: number;
  vehicle_photos: string[] | null;
  detail_photos: string[] | null;
  
  // Fahrzeugbeschreibung Details
  aufbau?: string | null;
  kraftstoffart?: string | null;
  motorart?: string | null;
  leistung?: string | null;
  getriebeart?: string | null;
  farbe?: string | null;
  gesamtgewicht?: string | null;
  hubraum?: string | null;
  anzahl_tueren?: string | null;
  anzahl_sitzplaetze?: string | null;
  faelligkeit_hu?: string | null;
  polster_typ?: string | null;
  bemerkungen?: string | null;
  
  // Wartung
  wartung_datum?: string | null;
  wartung_kilometerstand?: string | null;
  
  // Ausstattung (JSONB)
  serienausstattung?: string | null;
  sonderausstattung?: string | null;
  
  // Optischer Zustand (JSONB)
  optische_schaeden?: string | null;
  innenraum_zustand?: string | null;
  
  // Bereifung (JSONB)
  bereifung?: Array<{
    position: string;
    bezeichnung: string;
    art: string;
    profiltiefe: string;
  }> | null;
  
  // Zustandsbericht PDF (optional)
  zustandsbericht_pdf_url?: string | null;
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ["vehicles", "sorted-by-report-nr"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("report_nr", { ascending: true });

      if (error) throw error;
      // Cast bereifung from Json to proper type
      return data.map(vehicle => ({
        ...vehicle,
        bereifung: vehicle.bereifung as Array<{
          position: string;
          bezeichnung: string;
          art: string;
          profiltiefe: string;
        }> | null
      })) as Vehicle[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
