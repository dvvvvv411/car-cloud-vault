import { z } from 'zod';

export const callerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein').max(100),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein').max(100),
});

export const campaignUploadSchema = z.object({
  brandingId: z.string().uuid('Bitte wählen Sie ein Branding aus'),
  file: z.instanceof(File).refine(
    (file) => file.type === 'text/plain',
    'Nur .txt Dateien sind erlaubt'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'Datei darf maximal 10MB groß sein'
  ),
});

export const leadEmailSchema = z.object({
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
});

export type CallerFormData = z.infer<typeof callerSchema>;
export type CampaignUploadFormData = z.infer<typeof campaignUploadSchema>;
export type LeadEmailFormData = z.infer<typeof leadEmailSchema>;
