import { z } from 'zod';

export const brandingSchema = z.object({
  company_name: z.string().min(1, 'Unternehmensname ist erforderlich').max(200),
  case_number: z.string().min(1, 'Aktenzeichen ist erforderlich').max(100),
  lawyer_name: z.string().min(1, 'Anwaltsname ist erforderlich').max(200),
  lawyer_firm_name: z.string().min(1, 'Kanzleiname ist erforderlich').max(200),
  lawyer_firm_subtitle: z.string().max(200).optional(),
  lawyer_address_street: z.string().min(1, 'Straße ist erforderlich').max(200),
  lawyer_address_city: z.string().min(1, 'Stadt ist erforderlich').max(200),
  lawyer_email: z.string().email('Ungültige E-Mail-Adresse'),
  lawyer_phone: z.string().min(1, 'Telefonnummer ist erforderlich').max(50),
  lawyer_website_url: z.string().url('Ungültige URL'),
  is_active: z.boolean().default(true),
  resend_api_key: z.string().optional(),
  resend_sender_email: z.string().email('Ungültige E-Mail-Adresse').optional().or(z.literal('')),
  resend_sender_name: z.string().optional(),
  admin_email: z.string().email('Ungültige E-Mail-Adresse').optional().or(z.literal('')),
});

export type BrandingFormData = z.infer<typeof brandingSchema>;

// Helper function to generate slug from company name
export const generateSlug = (companyName: string): string => {
  return companyName
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};
