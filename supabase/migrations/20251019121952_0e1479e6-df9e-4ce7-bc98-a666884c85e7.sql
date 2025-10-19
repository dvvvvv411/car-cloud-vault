-- Clear images for vehicle with report_nr 4584
UPDATE vehicles 
SET 
  vehicle_photos = '[]'::jsonb,
  detail_photos = '[]'::jsonb
WHERE report_nr = '4584';