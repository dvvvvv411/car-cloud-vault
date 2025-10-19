-- Add new columns to vehicles table for Zustandsbericht details

-- Fahrzeugbeschreibung Details (text fields)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS aufbau TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS kraftstoffart TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS motorart TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS leistung TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS getriebeart TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS farbe TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS gesamtgewicht TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS hubraum TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS anzahl_tueren TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS anzahl_sitzplaetze TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS faelligkeit_hu TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS polster_typ TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS bemerkungen TEXT;

-- Wartung (text fields)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wartung_datum TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wartung_kilometerstand TEXT;

-- Ausstattung (JSONB arrays)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS serienausstattung JSONB DEFAULT '[]'::jsonb;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS sonderausstattung JSONB DEFAULT '[]'::jsonb;

-- Optischer Zustand (JSONB arrays)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS optische_schaeden JSONB DEFAULT '[]'::jsonb;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS innenraum_zustand JSONB DEFAULT '[]'::jsonb;

-- Bereifung (JSONB array for tire table data)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS bereifung JSONB DEFAULT '[]'::jsonb;