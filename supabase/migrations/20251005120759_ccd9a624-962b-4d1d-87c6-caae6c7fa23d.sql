-- Fix the update_brandings_updated_at function to have a secure search_path
CREATE OR REPLACE FUNCTION public.update_brandings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;