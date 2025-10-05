-- WICHTIG: Diese Befehle müssen mit Superuser-Rechten ausgeführt werden
-- Sie geben den anon und authenticated Rollen die Berechtigung, auf dem public Schema zu arbeiten
-- und INSERT-Operationen auf der inquiries Tabelle durchzuführen

-- 1. Schema-Zugriff gewähren
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. INSERT-Berechtigung auf inquiries Tabelle
GRANT INSERT ON TABLE public.inquiries TO anon, authenticated;

-- 3. SELECT-Berechtigung für Validierung (falls needed)
GRANT SELECT ON TABLE public.inquiries TO anon, authenticated;

-- Verification Query (nur zur Info, wird nicht in Produktion ausgegeben)
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' AND table_name = 'inquiries';