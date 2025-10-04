import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, X } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import { inquirySchema, InquiryFormData } from "@/lib/validation/inquirySchema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useToast } from "@/hooks/use-toast";

interface InquiryFormProps {
  selectedVehicles: string[];
  vehicles: Vehicle[];
  onRemoveVehicle: (chassis: string) => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  selectedVehicles,
  vehicles,
  onRemoveVehicle,
}) => {
  const { toast } = useToast();
  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      customerType: "private",
      companyName: "",
      firstName: "",
      lastName: "",
      street: "",
      zipCode: "",
      city: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const customerType = form.watch("customerType");

  const selectedVehicleData = vehicles.filter((v) =>
    selectedVehicles.includes(v.chassis)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const onSubmit = (data: InquiryFormData) => {
    const totalPrice = selectedVehicleData.reduce((sum, v) => sum + v.price, 0);
    
    console.log("Inquiry submitted:", {
      formData: data,
      selectedVehicles: selectedVehicleData,
      totalPrice,
    });

    toast({
      title: "Anfrage erfolgreich gesendet",
      description:
        "Vielen Dank für Ihre Anfrage. Unser Rechtsanwalt wird sich in Kürze bei Ihnen melden.",
    });

    // Reset form
    form.reset();
  };

  return (
    <div className="w-full animate-fade-in mb-24">
      {/* Selected Vehicles Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ihre ausgewählten Fahrzeuge ({selectedVehicleData.length})
        </h2>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-sm font-semibold text-foreground">Marke</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Modell</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Fahrgestell-Nr.</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Einzelpreis</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {selectedVehicleData.map((vehicle) => (
                <tr key={vehicle.chassis} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-foreground">{vehicle.brand}</td>
                  <td className="p-4 text-foreground">{vehicle.model}</td>
                  <td className="p-4 text-muted-foreground text-sm">{vehicle.chassis}</td>
                  <td className="p-4 text-right font-semibold text-primary">{formatPrice(vehicle.price)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onRemoveVehicle(vehicle.chassis)}
                      className="p-1 rounded-full hover:bg-destructive/20 text-destructive transition-colors"
                      aria-label="Fahrzeug entfernen"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto">
        <Form {...form}>
          <form id="inquiry-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Ihre Kontaktdaten
            </h3>

            {/* Customer Type */}
            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Kundentyp *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="cursor-pointer">
                          Privat
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business" className="cursor-pointer">
                          Geschäftlich
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Name (conditional) */}
            {customerType === "business" && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Unternehmensname *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ihr Unternehmensname"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vorname"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nachname"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Straße + Hausnummer *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Straße und Hausnummer"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PLZ *</FormLabel>
                    <FormControl>
                      <Input placeholder="PLZ" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stadt *</FormLabel>
                    <FormControl>
                      <Input placeholder="Stadt" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ihre@email.de"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+49 123 456789"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mitteilung (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ihre Nachricht an uns..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Info Box - After Form */}
      <div className="max-w-4xl mx-auto mt-8 mb-8 bg-accent/20 border-2 border-accent rounded-lg p-6">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 mt-1">
            <Info className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Keine verbindliche Bestellung
            </h3>
            <p className="text-base text-foreground/90 leading-relaxed">
              Sie geben hiermit <strong>keine verbindliche Bestellung</strong> auf. 
              Dies ist eine unverbindliche Anfrage für die ausgewählten Positionen. 
              Nach Absenden der Anfrage wird sich unser Rechtsanwalt kostenlos mit 
              Ihnen in Verbindung setzen, um alle Details zu besprechen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
