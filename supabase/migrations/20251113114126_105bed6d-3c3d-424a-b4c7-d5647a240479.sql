-- Add admin_email_signature column to brandings table
ALTER TABLE brandings 
ADD COLUMN admin_email_signature text NULL;

COMMENT ON COLUMN brandings.admin_email_signature IS 'HTML-Signatur für Verwaltungs E-Mail';