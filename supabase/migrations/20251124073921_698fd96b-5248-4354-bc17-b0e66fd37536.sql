-- Add branding_type enum and column
CREATE TYPE branding_type AS ENUM ('insolvenz', 'fahrzeuge');

ALTER TABLE brandings 
ADD COLUMN branding_type branding_type NOT NULL DEFAULT 'insolvenz';

CREATE INDEX idx_brandings_type ON brandings(branding_type);