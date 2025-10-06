-- Create cold_call_callers table
CREATE TABLE public.cold_call_callers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on cold_call_callers
ALTER TABLE public.cold_call_callers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cold_call_callers
CREATE POLICY "Only admins can view callers"
ON public.cold_call_callers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert callers"
ON public.cold_call_callers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update callers"
ON public.cold_call_callers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete callers"
ON public.cold_call_callers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create cold_call_campaigns table
CREATE TABLE public.cold_call_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES public.cold_call_callers(id) ON DELETE CASCADE,
  branding_id UUID NOT NULL REFERENCES public.brandings(id) ON DELETE CASCADE,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  campaign_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_leads INTEGER NOT NULL DEFAULT 0,
  invalid_count INTEGER NOT NULL DEFAULT 0,
  mailbox_count INTEGER NOT NULL DEFAULT 0,
  interested_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cold_call_campaigns
ALTER TABLE public.cold_call_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cold_call_campaigns
CREATE POLICY "Only admins can view campaigns"
ON public.cold_call_campaigns
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert campaigns"
ON public.cold_call_campaigns
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update campaigns"
ON public.cold_call_campaigns
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete campaigns"
ON public.cold_call_campaigns
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create cold_call_leads table
CREATE TABLE public.cold_call_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.cold_call_campaigns(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraint for status
ALTER TABLE public.cold_call_leads
ADD CONSTRAINT cold_call_leads_status_check
CHECK (status IN ('active', 'invalid', 'mailbox', 'interested'));

-- Enable RLS on cold_call_leads
ALTER TABLE public.cold_call_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cold_call_leads
CREATE POLICY "Only admins can view leads"
ON public.cold_call_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert leads"
ON public.cold_call_leads
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update leads"
ON public.cold_call_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete leads"
ON public.cold_call_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_cold_call_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for cold_call_leads
CREATE TRIGGER update_cold_call_leads_updated_at
BEFORE UPDATE ON public.cold_call_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_cold_call_leads_updated_at();