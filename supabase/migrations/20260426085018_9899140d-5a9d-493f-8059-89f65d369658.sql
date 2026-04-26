CREATE TABLE public.inquiry_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id uuid NOT NULL,
  activity_type text NOT NULL,
  old_value text,
  new_value text,
  inquiry_name text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiry_activity_log_created_at ON public.inquiry_activity_log (created_at DESC);
CREATE INDEX idx_inquiry_activity_log_inquiry_id ON public.inquiry_activity_log (inquiry_id);

ALTER TABLE public.inquiry_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view activity log"
ON public.inquiry_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert activity log"
ON public.inquiry_activity_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));