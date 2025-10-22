-- Add discount percentage field to inquiries table
ALTER TABLE inquiries 
ADD COLUMN discount_percentage numeric CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN discount_granted_at timestamp with time zone,
ADD COLUMN discount_granted_by uuid;

-- Add comments for documentation
COMMENT ON COLUMN inquiries.discount_percentage IS 'Discount in percentage (0-100) granted to the customer';
COMMENT ON COLUMN inquiries.discount_granted_at IS 'Timestamp when discount was granted';
COMMENT ON COLUMN inquiries.discount_granted_by IS 'User who granted the discount';