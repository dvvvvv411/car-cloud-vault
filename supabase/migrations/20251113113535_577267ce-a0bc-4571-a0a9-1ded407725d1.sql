-- Add admin_email column to brandings table for administrative email sending
ALTER TABLE brandings 
ADD COLUMN admin_email text NULL;

COMMENT ON COLUMN brandings.admin_email IS 'Verwaltungs E-Mail für speziellen Email-Versand';