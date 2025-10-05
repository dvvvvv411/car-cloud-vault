import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Branding {
  id: string;
  slug: string;
  company_name: string;
  case_number: string;
  kanzlei_logo_url: string | null;
  lawyer_photo_url: string | null;
  court_decision_pdf_url: string | null;
  lawyer_name: string;
  lawyer_firm_name: string;
  lawyer_firm_subtitle: string | null;
  lawyer_address_street: string;
  lawyer_address_city: string;
  lawyer_email: string;
  lawyer_phone: string;
  lawyer_website_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBranding = (slug: string) => {
  return useQuery({
    queryKey: ['branding', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Branding;
    },
    retry: false,
  });
};

export const useBrandings = () => {
  return useQuery({
    queryKey: ['brandings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Branding[];
    },
  });
};
