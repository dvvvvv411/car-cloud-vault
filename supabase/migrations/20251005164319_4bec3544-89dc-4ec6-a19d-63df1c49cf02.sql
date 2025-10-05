-- Policy für öffentlichen Lesezugriff auf Reservierungen
-- Dies erlaubt Leads (die nicht in auth.users sind) ihre Reservierungen zu sehen
CREATE POLICY "Anyone can view reservations"
ON public.lead_reserved_vehicles
FOR SELECT
USING (true);