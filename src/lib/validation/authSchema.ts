import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' })
    .max(255, { message: 'E-Mail darf maximal 255 Zeichen lang sein' }),
  password: z
    .string()
    .min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' })
    .max(100, { message: 'Passwort darf maximal 100 Zeichen lang sein' }),
});

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' })
    .max(255, { message: 'E-Mail darf maximal 255 Zeichen lang sein' }),
  password: z
    .string()
    .min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' })
    .max(100, { message: 'Passwort darf maximal 100 Zeichen lang sein' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});
