import { z } from "zod";

export const inquirySchema = z
  .object({
    customerType: z.enum(["private", "business"]),
    companyName: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    zipCode: z.string().min(1),
    city: z.string().min(1),
    email: z.string().min(1),
    phone: z.string().min(1),
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
      path: ["companyName"],
    }
  );

export type InquiryFormData = z.infer<typeof inquirySchema>;
