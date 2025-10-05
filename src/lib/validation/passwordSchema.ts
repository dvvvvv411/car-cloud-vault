import { z } from "zod";

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Aktuelles Passwort muss mindestens 6 Zeichen lang sein"),
  newPassword: z.string().min(6, "Neues Passwort muss mindestens 6 Zeichen lang sein"),
  confirmPassword: z.string().min(6, "Passwort-Bestätigung muss mindestens 6 Zeichen lang sein"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
