-- Create brandings table
CREATE TABLE public.brandings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Slug für URL (z.B. "tz-west_gmbh")
  slug TEXT UNIQUE NOT NULL,
  
  -- Firma / Case Information
  company_name TEXT NOT NULL,
  case_number TEXT NOT NULL,
  
  -- Logo & Bilder (Storage-URLs)
  kanzlei_logo_url TEXT,
  lawyer_photo_url TEXT,
  court_decision_pdf_url TEXT,
  
  -- Anwaltsdaten
  lawyer_name TEXT NOT NULL,
  lawyer_firm_name TEXT NOT NULL,
  lawyer_firm_subtitle TEXT,
  lawyer_address_street TEXT NOT NULL,
  lawyer_address_city TEXT NOT NULL,
  lawyer_email TEXT NOT NULL,
  lawyer_phone TEXT NOT NULL,
  lawyer_website_url TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brandings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read active brandings
CREATE POLICY "Brandings are viewable by everyone"
ON public.brandings
FOR SELECT
USING (is_active = true);

-- RLS Policy: Only admins can insert brandings
CREATE POLICY "Only admins can insert brandings"
ON public.brandings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Only admins can update brandings
CREATE POLICY "Only admins can update brandings"
ON public.brandings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Only admins can delete brandings
CREATE POLICY "Only admins can delete brandings"
ON public.brandings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', true);

-- Storage RLS: Everyone can view files
CREATE POLICY "Anyone can view branding assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'branding-assets');

-- Storage RLS: Only admins can upload
CREATE POLICY "Only admins can upload branding assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding-assets' AND
  public.has_role(auth.uid(), 'admin')
);

-- Storage RLS: Only admins can update
CREATE POLICY "Only admins can update branding assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding-assets' AND
  public.has_role(auth.uid(), 'admin')
);

-- Storage RLS: Only admins can delete
CREATE POLICY "Only admins can delete branding assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding-assets' AND
  public.has_role(auth.uid(), 'admin')
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_brandings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brandings_updated_at
BEFORE UPDATE ON public.brandings
FOR EACH ROW
EXECUTE FUNCTION public.update_brandings_updated_at();