-- 1. Grants für anon und authenticated Rollen
GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT ON public.inquiries TO authenticated;

-- 2. Policy ist bereits korrekt (nur zur Sicherheit nochmal)
DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;

CREATE POLICY "Public can create inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);