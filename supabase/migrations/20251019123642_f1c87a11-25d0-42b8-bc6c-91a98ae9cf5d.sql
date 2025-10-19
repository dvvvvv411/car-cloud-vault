-- Remove data:image URLs from vehicle_photos and detail_photos, keep only real https:// URLs
UPDATE vehicles
SET 
  vehicle_photos = (
    SELECT COALESCE(jsonb_agg(value), '[]'::jsonb)
    FROM jsonb_array_elements_text(vehicle_photos) 
    WHERE value LIKE 'https://%'
  ),
  detail_photos = (
    SELECT COALESCE(jsonb_agg(value), '[]'::jsonb)
    FROM jsonb_array_elements_text(detail_photos)
    WHERE value LIKE 'https://%'
  )
WHERE 
  vehicle_photos::text LIKE '%data:image%' 
  OR detail_photos::text LIKE '%data:image%';