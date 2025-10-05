-- Add Resend email configuration columns to brandings table
ALTER TABLE brandings 
ADD COLUMN IF NOT EXISTS resend_api_key TEXT,
ADD COLUMN IF NOT EXISTS resend_sender_email TEXT,
ADD COLUMN IF NOT EXISTS resend_sender_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN brandings.resend_api_key IS 'Resend API Key for sending confirmation emails';
COMMENT ON COLUMN brandings.resend_sender_email IS 'Sender email address for confirmation emails';
COMMENT ON COLUMN brandings.resend_sender_name IS 'Sender name for confirmation emails';