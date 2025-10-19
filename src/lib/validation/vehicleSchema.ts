import { z } from 'zod';

export const vehicleSchema = z.object({
  // Basic required fields
  brand: z.string().min(1, "Marke ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  chassis: z.string().min(1, "Fahrgestellnummer ist erforderlich"),
  report_nr: z.string().min(1, "Berichtsnummer ist erforderlich"),
  first_registration: z.string().min(1, "Erstzulassung ist erforderlich"),
  kilometers: z.coerce.number().min(0, "Kilometerstand muss positiv sein"),
  price: z.coerce.number().min(0, "Preis muss positiv sein"),
  
  // Fahrzeugbeschreibung Details (optional)
  aufbau: z.string().optional(),
  kraftstoffart: z.string().optional(),
  motorart: z.string().optional(),
  leistung: z.string().optional(),
  getriebeart: z.string().optional(),
  farbe: z.string().optional(),
  gesamtgewicht: z.string().optional(),
  hubraum: z.string().optional(),
  anzahl_tueren: z.string().optional(),
  anzahl_sitzplaetze: z.string().optional(),
  faelligkeit_hu: z.string().optional(),
  polster_typ: z.string().optional(),
  bemerkungen: z.string().optional(),
  
  // Wartung (optional)
  wartung_datum: z.string().optional(),
  wartung_kilometerstand: z.string().optional(),
  
  // Ausstattung (text arrays - will be converted to JSON)
  serienausstattung: z.string().optional(),
  sonderausstattung: z.string().optional(),
  
  // Optischer Zustand (text arrays)
  optische_schaeden: z.string().optional(),
  innenraum_zustand: z.string().optional(),
  
  // Bereifung (text - pipe separated)
  bereifung: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
