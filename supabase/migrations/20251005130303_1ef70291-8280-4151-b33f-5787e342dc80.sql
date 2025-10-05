-- Create inquiries table for storing vehicle inquiries from contact form
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branding_id UUID REFERENCES public.brandings(id) ON DELETE CASCADE,
  customer_type TEXT NOT NULL,
  company_name TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  selected_vehicles JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can insert inquiries (public contact form)
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can view inquiries
CREATE POLICY "Only admins can view inquiries"
ON public.inquiries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update inquiries
CREATE POLICY "Only admins can update inquiries"
ON public.inquiries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete inquiries
CREATE POLICY "Only admins can delete inquiries"
ON public.inquiries
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_inquiries_branding_id ON public.inquiries(branding_id);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);