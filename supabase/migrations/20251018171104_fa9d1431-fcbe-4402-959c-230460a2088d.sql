-- Remove all DEKRA PDFs and old vehicle images
UPDATE vehicles 
SET dekra_url = NULL, 
    image_url = NULL;

-- Drop the columns completely as they're no longer needed
ALTER TABLE vehicles DROP COLUMN IF EXISTS dekra_url;
ALTER TABLE vehicles DROP COLUMN IF EXISTS image_url;