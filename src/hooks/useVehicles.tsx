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
  image_url: string | null;
  vehicle_photos: string | null;
  detail_photos: string | null;
  dekra_url: string | null;
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Vehicle[];
    },
  });
};
