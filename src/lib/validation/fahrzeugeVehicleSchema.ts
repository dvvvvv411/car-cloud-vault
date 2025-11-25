import { z } from 'zod';

export const fahrzeugeVehicleSchema = z.object({
  // Required fields
  brand: z.string().min(1, "Marke ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  fin: z.string().min(1, "FIN ist erforderlich"),
  laufleistung: z.coerce.number().min(0, "Laufleistung muss positiv sein"),
  erstzulassung: z.string().min(1, "Erstzulassung ist erforderlich"),
  preis: z.coerce.number().min(0, "Preis muss positiv sein"),
  
  // Technical details (optional)
  leistung_kw: z.coerce.number().optional().nullable(),
  leistung_ps: z.coerce.number().optional().nullable(),
  motor_antrieb: z.string().optional(),
  farbe: z.string().optional(),
  innenausstattung: z.string().optional(),
  tueren: z.coerce.number().optional().nullable(),
  sitze: z.coerce.number().optional().nullable(),
  hubraum: z.string().optional(),
  
  // Equipment (textareas → will be converted to JSON arrays)
  garantie: z.string().optional(),
  highlights: z.string().optional(),
  assistenzsysteme: z.string().optional(),
  multimedia: z.string().optional(),
  technik_sicherheit: z.string().optional(),
  interieur: z.string().optional(),
  exterieur: z.string().optional(),
  sonstiges: z.string().optional(),
  
  // Branding assignment
  branding_ids: z.array(z.string()).min(1, "Mindestens ein Branding muss ausgewählt werden"),
});

export type FahrzeugeVehicleFormData = z.infer<typeof fahrzeugeVehicleSchema>;
