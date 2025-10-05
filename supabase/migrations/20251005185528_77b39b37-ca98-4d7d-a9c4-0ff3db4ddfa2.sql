-- Drop the old policy
DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;

-- Create new policy with public role for consistency
CREATE POLICY "Public can create inquiries"
ON public.inquiries
FOR INSERT
TO public
WITH CHECK (true);