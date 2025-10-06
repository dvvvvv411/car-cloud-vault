-- Add timestamp columns for all status changes to cold_call_leads
ALTER TABLE cold_call_leads
ADD COLUMN invalid_timestamp timestamp with time zone,
ADD COLUMN not_interested_timestamp timestamp with time zone,
ADD COLUMN interested_timestamp timestamp with time zone;