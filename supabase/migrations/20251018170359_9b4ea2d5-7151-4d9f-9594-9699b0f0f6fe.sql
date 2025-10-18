-- Add new columns for multiple images
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS vehicle_photos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS detail_photos jsonb DEFAULT '[]'::jsonb;

-- Migrate existing image_url to vehicle_photos array
UPDATE vehicles 
SET vehicle_photos = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '';

-- Add helpful comment
COMMENT ON COLUMN vehicles.vehicle_photos IS 'Array of vehicle photo URLs (JSON)';
COMMENT ON COLUMN vehicles.detail_photos IS 'Array of detail/damage photo URLs (JSON)';