ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS inquiries_visible_from timestamptz NULL;

DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
CREATE POLICY "Admins can update user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP FUNCTION IF EXISTS public.get_all_users();

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  role app_role,
  inquiries_visible_from timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ur.role, 'user'::app_role) as role,
    ur.inquiries_visible_from
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY au.created_at DESC;
$function$;