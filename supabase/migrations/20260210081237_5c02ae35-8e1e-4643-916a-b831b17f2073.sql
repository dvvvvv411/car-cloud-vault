CREATE TABLE public.amtsgericht_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  inquiry_name text
);

ALTER TABLE public.amtsgericht_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view history"
  ON public.amtsgericht_status_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert history"
  ON public.amtsgericht_status_history FOR INSERT
  TO authenticated WITH CHECK (true);