-- Alte Policy löschen
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

-- Neue Policy erstellen, die explizit anonyme Zugriffe erlaubt
CREATE POLICY "Public can create inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);