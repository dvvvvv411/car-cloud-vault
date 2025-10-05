-- Create lead_campaigns table
CREATE TABLE public.lead_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branding_id UUID NOT NULL REFERENCES public.brandings(id) ON DELETE CASCADE,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  campaign_name TEXT NOT NULL,
  total_leads INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branding_id, campaign_name)
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.lead_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  branding_id UUID NOT NULL REFERENCES public.brandings(id) ON DELETE CASCADE,
  has_logged_in BOOLEAN NOT NULL DEFAULT false,
  first_login_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER NOT NULL DEFAULT 0,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, branding_id)
);

-- Add lead_id to inquiries table
ALTER TABLE public.inquiries
ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_leads_email_branding ON public.leads(email, branding_id);
CREATE INDEX idx_leads_campaign ON public.leads(campaign_id);
CREATE INDEX idx_inquiries_lead ON public.inquiries(lead_id);

-- Enable RLS
ALTER TABLE public.lead_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_campaigns (only admins)
CREATE POLICY "Only admins can view lead campaigns"
ON public.lead_campaigns
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert lead campaigns"
ON public.lead_campaigns
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update lead campaigns"
ON public.lead_campaigns
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete lead campaigns"
ON public.lead_campaigns
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for leads (only admins)
CREATE POLICY "Only admins can view leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete leads"
ON public.leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));