-- Fix search_path for convert_first_registration_format function
CREATE OR REPLACE FUNCTION convert_first_registration_format()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE vehicles
  SET first_registration = 
    CASE 
      WHEN first_registration ~ '^\d{2}\.\d{2}\.\d{4}$' THEN
        SUBSTRING(first_registration FROM 4 FOR 2) || '/' || SUBSTRING(first_registration FROM 9 FOR 2)
      ELSE first_registration
    END
  WHERE first_registration ~ '^\d{2}\.\d{2}\.\d{4}$';
END;
$$;

-- Fix search_path for auto_format_first_registration function
CREATE OR REPLACE FUNCTION auto_format_first_registration()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.first_registration ~ '^\d{2}\.\d{2}\.\d{4}$' THEN
    NEW.first_registration := 
      SUBSTRING(NEW.first_registration FROM 4 FOR 2) || '/' || 
      SUBSTRING(NEW.first_registration FROM 9 FOR 2);
  END IF;
  RETURN NEW;
END;
$$;