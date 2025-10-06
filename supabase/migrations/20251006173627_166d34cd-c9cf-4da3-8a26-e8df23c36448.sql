-- Add 'not_interested' status to cold_call_leads
ALTER TABLE cold_call_leads 
DROP CONSTRAINT IF EXISTS cold_call_leads_status_check;

ALTER TABLE cold_call_leads 
ADD CONSTRAINT cold_call_leads_status_check 
CHECK (status IN ('active', 'invalid', 'mailbox', 'interested', 'not_interested'));

-- Add mailbox_timestamp column to cold_call_leads
ALTER TABLE cold_call_leads
ADD COLUMN IF NOT EXISTS mailbox_timestamp timestamp with time zone;

-- Add not_interested_count to cold_call_campaigns
ALTER TABLE cold_call_campaigns
ADD COLUMN IF NOT EXISTS not_interested_count integer NOT NULL DEFAULT 0;