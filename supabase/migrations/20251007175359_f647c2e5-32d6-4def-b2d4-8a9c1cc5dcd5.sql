-- Add email_sent_status column to cold_call_leads table
ALTER TABLE cold_call_leads 
ADD COLUMN email_sent_status TEXT CHECK (email_sent_status IN ('pending', 'sent', 'failed'));