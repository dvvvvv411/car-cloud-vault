-- Create singleton telegram_settings table
CREATE TABLE public.telegram_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  chat_id text,
  notify_new_inquiry boolean NOT NULL DEFAULT true,
  notify_moechte_rgkv boolean NOT NULL DEFAULT true,
  notify_rgkv_sent boolean NOT NULL DEFAULT true,
  notify_amtsgericht_ready boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Seed singleton row, taking first existing chat_id from brandings if present
INSERT INTO public.telegram_settings (id, chat_id)
VALUES (
  1,
  (SELECT telegram_chat_id FROM public.brandings WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id <> '' LIMIT 1)
);

-- RLS
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view telegram settings"
ON public.telegram_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update telegram settings"
ON public.telegram_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_telegram_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_telegram_settings_updated_at
BEFORE UPDATE ON public.telegram_settings
FOR EACH ROW EXECUTE FUNCTION public.update_telegram_settings_updated_at();

-- Drop old per-branding telegram columns
ALTER TABLE public.brandings
  DROP COLUMN IF EXISTS telegram_chat_id,
  DROP COLUMN IF EXISTS telegram_notify_new_inquiry,
  DROP COLUMN IF EXISTS telegram_notify_moechte_rgkv,
  DROP COLUMN IF EXISTS telegram_notify_rgkv_sent,
  DROP COLUMN IF EXISTS telegram_notify_amtsgericht_ready;