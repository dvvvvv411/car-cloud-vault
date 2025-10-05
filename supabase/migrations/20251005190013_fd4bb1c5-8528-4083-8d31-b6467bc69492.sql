-- Drop the old policy
DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;

-- Create new policy without TO clause (applies to ALL roles including anon)
CREATE POLICY "Public can create inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (true);