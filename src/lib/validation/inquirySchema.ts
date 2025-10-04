import { z } from "zod";

export const inquirySchema = z
  .object({
    customerType: z.enum(["private", "business"], {
      required_error: "Bitte wählen Sie Privat oder Geschäftlich",
    }),
    companyName: z.string().optional(),
    firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
    lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
    street: z.string().min(3, "Bitte vollständige Adresse eingeben"),
    zipCode: z.string().regex(/^\d{5}$/, "PLZ muss 5 Ziffern haben"),
    city: z.string().min(2, "Bitte Stadt eingeben"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    phone: z.string().min(6, "Telefonnummer zu kurz"),
    message: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.customerType === "business") {
        return data.companyName && data.companyName.length > 0;
      }
      return true;
    },
    {
      message: "Unternehmensname ist erforderlich für Geschäftskunden",
      path: ["companyName"],
    }
  );

export type InquiryFormData = z.infer<typeof inquirySchema>;
