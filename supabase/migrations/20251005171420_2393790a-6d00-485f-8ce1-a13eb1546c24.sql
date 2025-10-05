-- Add call_priority column to inquiries table
ALTER TABLE inquiries ADD COLUMN call_priority boolean DEFAULT false;