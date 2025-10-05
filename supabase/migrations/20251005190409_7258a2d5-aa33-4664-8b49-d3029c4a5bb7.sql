-- Drop the old policy
DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;

-- IMPORTANT: Explicitly specify anon and authenticated roles
CREATE POLICY "Public can create inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);