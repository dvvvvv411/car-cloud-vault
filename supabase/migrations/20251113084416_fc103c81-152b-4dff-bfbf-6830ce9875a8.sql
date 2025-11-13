-- Create storage bucket for inquiry documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inquiry-documents', 'inquiry-documents', true);

-- RLS Policy: Authenticated users can upload inquiry documents
CREATE POLICY "Authenticated users can upload inquiry documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inquiry-documents');

-- RLS Policy: Public can read inquiry documents
CREATE POLICY "Public can read inquiry documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inquiry-documents');