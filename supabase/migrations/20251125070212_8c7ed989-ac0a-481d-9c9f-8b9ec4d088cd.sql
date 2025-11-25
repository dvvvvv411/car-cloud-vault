-- Add new flexible equipment sections column
ALTER TABLE fahrzeuge_vehicles 
ADD COLUMN ausstattung_sections jsonb DEFAULT '[]'::jsonb;

-- Create index for performance
CREATE INDEX idx_fahrzeuge_vehicles_ausstattung 
ON fahrzeuge_vehicles USING gin(ausstattung_sections);

-- Migrate existing data to new structure
UPDATE fahrzeuge_vehicles
SET ausstattung_sections = (
  SELECT jsonb_agg(section)
  FROM (
    SELECT jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', title,
      'content', content
    ) as section
    FROM (
      SELECT * FROM (
        VALUES 
          ('Garantie', garantie),
          ('Highlights', CASE 
            WHEN highlights IS NOT NULL AND jsonb_array_length(highlights) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(highlights))
            ELSE NULL 
          END),
          ('Assistenzsysteme', CASE 
            WHEN assistenzsysteme IS NOT NULL AND jsonb_array_length(assistenzsysteme) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(assistenzsysteme))
            ELSE NULL 
          END),
          ('Multimedia', CASE 
            WHEN multimedia IS NOT NULL AND jsonb_array_length(multimedia) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(multimedia))
            ELSE NULL 
          END),
          ('Technik & Sicherheit', CASE 
            WHEN technik_sicherheit IS NOT NULL AND jsonb_array_length(technik_sicherheit) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(technik_sicherheit))
            ELSE NULL 
          END),
          ('Interieur', CASE 
            WHEN interieur IS NOT NULL AND jsonb_array_length(interieur) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(interieur))
            ELSE NULL 
          END),
          ('Exterieur', CASE 
            WHEN exterieur IS NOT NULL AND jsonb_array_length(exterieur) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(exterieur))
            ELSE NULL 
          END),
          ('Sonstiges', CASE 
            WHEN sonstiges IS NOT NULL AND jsonb_array_length(sonstiges) > 0 
            THEN (SELECT string_agg(value::text, E'\n') FROM jsonb_array_elements_text(sonstiges))
            ELSE NULL 
          END)
      ) AS old_sections(title, content)
    ) AS old_sections(title, content)
    WHERE content IS NOT NULL AND content != ''
  ) sections
);

-- Drop old columns after successful migration
ALTER TABLE fahrzeuge_vehicles 
DROP COLUMN garantie,
DROP COLUMN highlights,
DROP COLUMN assistenzsysteme,
DROP COLUMN multimedia,
DROP COLUMN technik_sicherheit,
DROP COLUMN interieur,
DROP COLUMN exterieur,
DROP COLUMN sonstiges;