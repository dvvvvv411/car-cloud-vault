-- Erlaubt allen (anon + authenticated) leads für Foreign Key Validierung zu prüfen
CREATE POLICY "Anyone can validate lead references"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (true);