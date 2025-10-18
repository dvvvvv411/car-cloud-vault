import { z } from 'zod';

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Marke ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  chassis: z.string().min(1, "Fahrgestellnummer ist erforderlich"),
  report_nr: z.string().min(1, "Berichtsnummer ist erforderlich"),
  first_registration: z.string().min(1, "Erstzulassung ist erforderlich"),
  kilometers: z.coerce.number().min(0, "Kilometerstand muss positiv sein"),
  price: z.coerce.number().min(0, "Preis muss positiv sein"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
