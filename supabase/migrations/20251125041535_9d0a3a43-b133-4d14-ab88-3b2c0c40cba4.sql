-- Create fahrzeuge_vehicles table (completely independent from vehicles table)
CREATE TABLE fahrzeuge_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic vehicle data
  brand text NOT NULL,
  model text NOT NULL,
  fin text NOT NULL UNIQUE,
  
  -- Technical data
  leistung_kw integer,
  leistung_ps integer,
  laufleistung integer NOT NULL,
  erstzulassung text NOT NULL,
  motor_antrieb text,
  farbe text,
  innenausstattung text,
  tueren integer,
  sitze integer,
  hubraum text,
  
  -- Price
  preis numeric NOT NULL,
  
  -- Equipment (JSONB for flexible lists)
  garantie text,
  highlights jsonb DEFAULT '[]'::jsonb,
  assistenzsysteme jsonb DEFAULT '[]'::jsonb,
  multimedia jsonb DEFAULT '[]'::jsonb,
  technik_sicherheit jsonb DEFAULT '[]'::jsonb,
  interieur jsonb DEFAULT '[]'::jsonb,
  exterieur jsonb DEFAULT '[]'::jsonb,
  sonstiges jsonb DEFAULT '[]'::jsonb,
  
  -- Images (only vehicle photos, no detail_photos!)
  vehicle_photos jsonb DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE fahrzeuge_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fahrzeuge vehicles are viewable by everyone"
  ON fahrzeuge_vehicles FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert fahrzeuge vehicles"
  ON fahrzeuge_vehicles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update fahrzeuge vehicles"
  ON fahrzeuge_vehicles FOR UPDATE
  USING (true);

CREATE POLICY "Only authenticated users can delete fahrzeuge vehicles"
  ON fahrzeuge_vehicles FOR DELETE
  USING (true);

-- Indexes
CREATE INDEX idx_fahrzeuge_vehicles_fin ON fahrzeuge_vehicles(fin);
CREATE INDEX idx_fahrzeuge_vehicles_created_at ON fahrzeuge_vehicles(created_at DESC);

-- Junction table for multi-branding
CREATE TABLE fahrzeuge_vehicle_brandings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES fahrzeuge_vehicles(id) ON DELETE CASCADE,
  branding_id uuid NOT NULL REFERENCES brandings(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  
  -- A vehicle can only be assigned once per branding
  UNIQUE(vehicle_id, branding_id)
);

-- RLS Policies for junction table
ALTER TABLE fahrzeuge_vehicle_brandings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fahrzeuge vehicle brandings are viewable by everyone"
  ON fahrzeuge_vehicle_brandings FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can manage fahrzeuge vehicle brandings"
  ON fahrzeuge_vehicle_brandings FOR ALL
  USING (true);

-- Indexes for junction table
CREATE INDEX idx_fahrzeuge_vehicle_brandings_vehicle ON fahrzeuge_vehicle_brandings(vehicle_id);
CREATE INDEX idx_fahrzeuge_vehicle_brandings_branding ON fahrzeuge_vehicle_brandings(branding_id);

-- Storage bucket for fahrzeuge vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fahrzeuge-vehicle-images', 'fahrzeuge-vehicle-images', true);

-- RLS Policies for storage bucket
CREATE POLICY "Fahrzeuge vehicle images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fahrzeuge-vehicle-images');

CREATE POLICY "Authenticated users can upload fahrzeuge vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fahrzeuge-vehicle-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update fahrzeuge vehicle images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'fahrzeuge-vehicle-images');

CREATE POLICY "Authenticated users can delete fahrzeuge vehicle images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'fahrzeuge-vehicle-images');