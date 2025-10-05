-- Create inquiry_notes table
CREATE TABLE public.inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add status_updated_at column to inquiries
ALTER TABLE public.inquiries 
ADD COLUMN status_updated_at timestamptz DEFAULT now();

-- Create inquiry_status enum
CREATE TYPE inquiry_status AS ENUM (
  'Neu',
  'Möchte RG/KV',
  'RG/KV gesendet',
  'Bezahlt',
  'Exchanged'
);

-- Update existing status values and convert to enum
UPDATE public.inquiries SET status = 'Neu' WHERE status = 'new' OR status IS NULL OR status = '';

-- Drop default before type change
ALTER TABLE public.inquiries ALTER COLUMN status DROP DEFAULT;

-- Change column type
ALTER TABLE public.inquiries 
ALTER COLUMN status TYPE inquiry_status USING 'Neu'::inquiry_status;

-- Set new default
ALTER TABLE public.inquiries 
ALTER COLUMN status SET DEFAULT 'Neu'::inquiry_status;

-- Enable RLS on inquiry_notes
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiry_notes
CREATE POLICY "Only admins can view inquiry notes"
ON public.inquiry_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can create inquiry notes"
ON public.inquiry_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update inquiry notes"
ON public.inquiry_notes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete inquiry notes"
ON public.inquiry_notes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on inquiry_notes
CREATE OR REPLACE FUNCTION public.update_inquiry_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_inquiry_notes_updated_at
BEFORE UPDATE ON public.inquiry_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_inquiry_notes_updated_at();