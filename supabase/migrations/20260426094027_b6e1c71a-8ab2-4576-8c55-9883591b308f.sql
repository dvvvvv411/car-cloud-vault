ALTER TABLE public.brandings
  ADD COLUMN IF NOT EXISTS seven_api_key text,
  ADD COLUMN IF NOT EXISTS sms_sender_name text,
  ADD COLUMN IF NOT EXISTS sms_confirmation_template text DEFAULT 'Hallo {vorname}, vielen Dank fuer Ihre Anfrage. Wir melden uns in Kuerze telefonisch bei Ihnen. Ihr Team {kanzlei}';