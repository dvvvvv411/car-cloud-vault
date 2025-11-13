import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pencil } from "lucide-react";
import { Inquiry } from "@/hooks/useInquiries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, InquiryFormData } from "@/lib/validation/inquirySchema";
import { useUpdateInquiryCustomerInfo } from "@/hooks/useUpdateInquiryCustomerInfo";
import { useState } from "react";

interface EditCustomerInfoDialogProps {
  inquiry: Inquiry;
}

export const EditCustomerInfoDialog = ({ inquiry }: EditCustomerInfoDialogProps) => {
  const [open, setOpen] = useState(false);
  const updateCustomerInfo = useUpdateInquiryCustomerInfo();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      customerType: inquiry.customer_type as "private" | "business",
      companyName: inquiry.company_name || "",
      firstName: inquiry.first_name,
      lastName: inquiry.last_name,
      street: inquiry.street,
      zipCode: inquiry.zip_code,
      city: inquiry.city,
      email: inquiry.email,
      phone: inquiry.phone,
    },
  });

  const customerType = watch("customerType");

  const onSubmit = async (data: InquiryFormData) => {
    await updateCustomerInfo.mutateAsync({
      inquiryId: inquiry.id,
      customerType: data.customerType,
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      street: data.street,
      zipCode: data.zipCode,
      city: data.city,
      email: data.email,
      phone: data.phone,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kundeninformationen bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Kundentyp</Label>
            <RadioGroup
              value={customerType}
              onValueChange={(value) => {
                setValue("customerType", value as "private" | "business", { 
                  shouldValidate: true 
                });
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">
                  Privatkunde
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="cursor-pointer">
                  Geschäftskunde
                </Label>
              </div>
            </RadioGroup>
          </div>

          {customerType === "business" && (
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Firmenname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                {...register("companyName")}
                placeholder="Firmenname"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Vorname"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Nachname"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">
              Straße <span className="text-destructive">*</span>
            </Label>
            <Input
              id="street"
              {...register("street")}
              placeholder="Straße und Hausnummer"
            />
            {errors.street && (
              <p className="text-sm text-destructive">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">
                PLZ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                {...register("zipCode")}
                placeholder="PLZ"
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive">{errors.zipCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                Stadt <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Stadt"
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-Mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="E-Mail"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="Telefon"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateCustomerInfo.isPending}>
              {updateCustomerInfo.isPending ? "Speichert..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
