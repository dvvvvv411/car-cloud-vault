import { z } from "zod";

export const userSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Gültige E-Mail-Adresse erforderlich" })
    .max(255, { message: "E-Mail darf maximal 255 Zeichen lang sein" }),
  password: z
    .string()
    .min(6, { message: "Passwort muss mindestens 6 Zeichen lang sein" })
    .max(100, { message: "Passwort darf maximal 100 Zeichen lang sein" }),
  role: z.enum(['user', 'admin']).default('user'),
});

export type UserFormData = z.infer<typeof userSchema>;
