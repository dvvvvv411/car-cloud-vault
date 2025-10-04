-- Create vehicles table
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  chassis text UNIQUE NOT NULL,
  report_nr text NOT NULL,
  first_registration text NOT NULL,
  kilometers integer NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text,
  dekra_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_vehicles_chassis ON public.vehicles(chassis);
CREATE INDEX idx_vehicles_brand ON public.vehicles(brand);

-- Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view vehicles (public access)
CREATE POLICY "Vehicles are viewable by everyone"
  ON public.vehicles
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert vehicles
CREATE POLICY "Only authenticated users can insert vehicles"
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update vehicles
CREATE POLICY "Only authenticated users can update vehicles"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can delete vehicles
CREATE POLICY "Only authenticated users can delete vehicles"
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial vehicle data
INSERT INTO public.vehicles (brand, model, chassis, report_nr, first_registration, kilometers, price) VALUES
('BMW', 'X5 M Competition', 'WBSJU010709K42232', '0993', '01/22', 79935, 41230.00),
('Volkswagen', 'T6 2.0 TDI Kombi lang (50)', 'WV2ZZZ7HZHH140678', '1135', '04/17', 115621, 5009.90),
('Volkswagen', 'T6.1 2.0 TDI Kombi L1H1 FWD', 'WV2ZZZ7HZLX010470', '2519', '03/20', 82751, 10311.00),
('Volkswagen', 'T6 2.0 TSI Kasten', 'WV1ZZZ7HZKH038702', '3367', '11/18', 85461, 8654.80),
('Volkswagen', 'T6.1 2.0 TDI Kombi L1H1 FWD', 'WV2ZZZ7HZLX009005', '3864', '02/20', 84613, 10066.70);