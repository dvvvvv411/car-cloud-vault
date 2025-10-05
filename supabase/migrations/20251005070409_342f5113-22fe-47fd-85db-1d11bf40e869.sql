-- Create storage buckets for vehicle images and reports
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('vehicle-images', 'vehicle-images', true),
  ('vehicle-reports', 'vehicle-reports', true);

-- RLS policies for vehicle-images bucket
CREATE POLICY "Admins can upload vehicle images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update vehicle images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete vehicle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-images' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view vehicle images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vehicle-images');

-- RLS policies for vehicle-reports bucket
CREATE POLICY "Admins can upload vehicle reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-reports' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update vehicle reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-reports' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete vehicle reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-reports' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view vehicle reports"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vehicle-reports');