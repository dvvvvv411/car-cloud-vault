-- Tabelle für Lead-spezifische Fahrzeug-Reservierungen
CREATE TABLE public.lead_reserved_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  vehicle_chassis text NOT NULL,
  reserved_at timestamp with time zone DEFAULT now(),
  reserved_by uuid REFERENCES auth.users(id),
  UNIQUE(lead_id, vehicle_chassis)
);

-- RLS aktivieren
ALTER TABLE public.lead_reserved_vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins können alles verwalten
CREATE POLICY "Admins can manage all reservations"
ON public.lead_reserved_vehicles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indices für Performance
CREATE INDEX idx_lead_reserved_vehicles_lead_id ON public.lead_reserved_vehicles(lead_id);
CREATE INDEX idx_lead_reserved_vehicles_chassis ON public.lead_reserved_vehicles(vehicle_chassis);