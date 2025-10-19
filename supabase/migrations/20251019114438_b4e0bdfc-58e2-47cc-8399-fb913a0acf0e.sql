-- Clear all vehicle images from database
UPDATE vehicles 
SET 
  vehicle_photos = '[]'::jsonb,
  detail_photos = '[]'::jsonb;