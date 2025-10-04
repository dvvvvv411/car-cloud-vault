import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, ChevronLeft, ChevronDown } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import { inquirySchema, InquiryFormData } from "@/lib/validation/inquirySchema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { useToast } from "@/hooks/use-toast";

interface InquiryFormProps {
  selectedVehicles: string[];
  vehicles: Vehicle[];
  onRemoveVehicle: (chassis: string) => void;
  onBack: () => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  selectedVehicles,
  vehicles,
  onRemoveVehicle,
  onBack,
}) => {
  const { toast } = useToast();
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);
  const form = useForm<InquiryFormData>({
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
    <div className="w-full animate-fade-in mb-[200px]">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-foreground hover:text-primary transition-colors w-full sm:w-auto h-12"
      >
        <ChevronLeft className="h-5 w-5 mr-2" />
        Zurück zur Übersicht
      </Button>

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 relative">
        {/* Left Column: Selected Vehicles */}
        <div className="self-start">
          {/* Mobile: Collapsible Version */}
          <div className="lg:hidden">
            <Collapsible open={isVehiclesOpen} onOpenChange={setIsVehiclesOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/5 transition-colors">
                  <h2 className="text-lg font-bold text-foreground">
                    Ihre ausgewählten Fahrzeuge ({selectedVehicleData.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-primary text-lg">
                      {formatPrice(selectedVehicleData.reduce((sum, v) => sum + v.price, 0))}
                    </p>
                    <ChevronDown className={`h-5 w-5 text-foreground transition-transform duration-200 ${isVehiclesOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="space-y-3">
                  {selectedVehicleData.map((vehicle) => (
                    <div key={vehicle.chassis} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground text-base">{vehicle.brand}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                        </div>
                        <p className="font-bold text-primary text-lg">{formatPrice(vehicle.price)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">FIN: {vehicle.chassis}</p>
                    </div>
                  ))}
                  
                  {/* Gesamtpreis Card */}
                  <div className="bg-white/10 backdrop-blur-md border border-primary/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground">Gesamtpreis:</p>
                      <p className="font-bold text-primary text-xl">
                        {formatPrice(selectedVehicleData.reduce((sum, v) => sum + v.price, 0))}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Alle Preise exkl. MwSt.</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {/* Desktop: Table View */}
          <div className="hidden lg:block">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3 md:mb-4">
              Ihre ausgewählten Fahrzeuge ({selectedVehicleData.length})
            </h2>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "hsl(var(--divider))" }}>
                  <th className="text-left p-2 md:p-4 text-xs md:text-sm font-semibold text-foreground">Marke</th>
                  <th className="text-left p-2 md:p-4 text-xs md:text-sm font-semibold text-foreground">Modell</th>
                  <th className="text-left p-2 md:p-4 text-xs md:text-sm font-semibold text-foreground">Fahrgestell-Nr.</th>
                  <th className="text-right p-2 md:p-4 text-xs md:text-sm font-semibold text-foreground">Preis</th>
                </tr>
              </thead>
              <tbody>
                {selectedVehicleData.map((vehicle) => (
                  <tr key={vehicle.chassis} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: "hsl(var(--divider))" }}>
                    <td className="p-2 md:p-4 text-sm md:text-base text-foreground">{vehicle.brand}</td>
                    <td className="p-2 md:p-4 text-sm md:text-base text-foreground">{vehicle.model}</td>
                    <td className="p-2 md:p-4 text-muted-foreground text-xs md:text-sm">{vehicle.chassis}</td>
                    <td className="p-2 md:p-4 text-right font-semibold text-primary text-sm md:text-base">{formatPrice(vehicle.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-white/5" style={{ borderColor: "hsl(var(--divider))" }}>
                  <td colSpan={3} className="p-2 md:p-4 text-right font-semibold text-foreground text-sm md:text-base">
                    Gesamtpreis:
                  </td>
                  <td className="p-2 md:p-4 text-right font-bold text-primary text-base md:text-lg">
                    {formatPrice(selectedVehicleData.reduce((sum, v) => sum + v.price, 0))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-2 md:px-4 pb-3 md:pb-4 pt-1 md:pt-2 text-right text-xs md:text-sm text-muted-foreground">
                    Alle Preise exkl. MwSt.
                  </td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: "hsl(var(--divider))" }} />

        {/* Right Column: Contact Form */}
        <div className="self-start">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3 md:mb-4">
            Ihre Kontaktdaten
          </h2>
          <Form {...form}>
            <form id="inquiry-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-5 md:p-6">
              {/* Customer Type */}
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="text-sm md:text-base">Kundentyp *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
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
                  </FormItem>
                )}
              />

              <Separator className="my-6" style={{ backgroundColor: "hsl(var(--divider))" }} />

              {/* Company Name (conditional) */}
              {customerType === "business" && (
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-sm md:text-base">Unternehmensname *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ihr Unternehmensname"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
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
                      <FormLabel className="text-sm md:text-base">Vorname *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Vorname"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Nachname *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nachname"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
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
                    <FormLabel className="text-sm md:text-base">Straße + Hausnummer *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Straße und Hausnummer"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">PLZ *</FormLabel>
                      <FormControl>
                        <Input placeholder="PLZ" className="h-12" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Stadt *</FormLabel>
                      <FormControl>
                        <Input placeholder="Stadt" className="h-12" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-6" style={{ backgroundColor: "hsl(var(--divider))" }} />

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">E-Mail *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ihre@email.de"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Telefonnummer *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+49 123 456789"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
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
                    <FormLabel className="text-sm md:text-base">Mitteilung (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ihre Nachricht an uns..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
