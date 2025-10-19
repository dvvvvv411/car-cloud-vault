-- Create function to convert existing first_registration from DD.MM.YYYY to MM/YY
CREATE OR REPLACE FUNCTION convert_first_registration_format()
RETURNS void AS $$
BEGIN
  UPDATE vehicles
  SET first_registration = 
    CASE 
      -- Check if format is DD.MM.YYYY (10 characters with dots)
      WHEN first_registration ~ '^\d{2}\.\d{2}\.\d{4}$' THEN
        -- Extract month and last 2 digits of year: MM/YY
        SUBSTRING(first_registration FROM 4 FOR 2) || '/' || SUBSTRING(first_registration FROM 9 FOR 2)
      -- If already in MM/YY format or other format, keep as is
      ELSE first_registration
    END
  WHERE first_registration ~ '^\d{2}\.\d{2}\.\d{4}$'; -- Only update DD.MM.YYYY format
END;
$$ LANGUAGE plpgsql;

-- Execute the conversion for all existing records
SELECT convert_first_registration_format();

-- Create trigger function to auto-format new/updated entries
CREATE OR REPLACE FUNCTION auto_format_first_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only convert if format is DD.MM.YYYY
  IF NEW.first_registration ~ '^\d{2}\.\d{2}\.\d{4}$' THEN
    NEW.first_registration := 
      SUBSTRING(NEW.first_registration FROM 4 FOR 2) || '/' || 
      SUBSTRING(NEW.first_registration FROM 9 FOR 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically format first_registration on INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_format_first_registration ON vehicles;
CREATE TRIGGER trigger_format_first_registration
  BEFORE INSERT OR UPDATE OF first_registration
  ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION auto_format_first_registration();