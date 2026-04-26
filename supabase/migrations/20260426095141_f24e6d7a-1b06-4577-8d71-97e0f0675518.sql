ALTER TABLE public.brandings
ADD COLUMN IF NOT EXISTS sms_documents_sent_template TEXT
DEFAULT 'Hallo {vorname}, Ihre Vertragsunterlagen wurden soeben per E-Mail an Sie versendet. Bitte pruefen Sie Ihr Postfach (auch Spam). Ihr Team {kanzlei}';