import { CheckCircle2, User, Mail, Phone, Building2, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/hooks/useVehicles";
import type { InquiryFormData } from "@/lib/validation/inquirySchema";

interface InquiryConfirmationProps {
  inquiry: InquiryFormData;
  vehicles: Vehicle[];
  totalPrice: number;
  onBackToList: () => void;
}

export const InquiryConfirmation = ({
  inquiry,
  vehicles,
  totalPrice,
  onBackToList,
}: InquiryConfirmationProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km) + " km";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Modern Success Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl" />
        <div className="relative bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full animate-pulse" />
              <CheckCircle2 className="relative h-20 w-20 text-green-500 animate-scale-in" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Anfrage erfolgreich versendet!
          </h1>
          <p className="text-lg text-muted-foreground">
            Vielen Dank für Ihre Anfrage. Der Rechtsanwalt wird sich in Kürze bei Ihnen melden.
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left Column - Vehicles Summary */}
        <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-6 lg:col-span-3 h-full shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Angefragte Fahrzeuge</h2>
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-3 font-semibold">Marke</th>
                    <th className="text-left py-3 px-3 font-semibold">Modell</th>
                    <th className="text-left py-3 px-3 font-semibold">Erstzulassung</th>
                    <th className="text-left py-3 px-3 font-semibold">Kilometerstand</th>
                    <th className="text-right py-3 px-3 font-semibold">Preis</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-border/30 last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-3 font-medium">{vehicle.brand}</td>
                      <td className="py-4 px-3">{vehicle.model}</td>
                      <td className="py-4 px-3 text-muted-foreground">{vehicle.first_registration}</td>
                      <td className="py-4 px-3 text-muted-foreground">{formatKilometers(vehicle.kilometers)}</td>
                      <td className="py-4 px-3 text-right font-bold text-primary">{formatPrice(vehicle.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                  <div className="font-medium text-lg mb-2">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erstzulassung:</span>
                      <span>{vehicle.first_registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kilometerstand:</span>
                      <span>{formatKilometers(vehicle.kilometers)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Preis:</span>
                      <span>{formatPrice(vehicle.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="flex justify-end pt-6">
              <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg px-6 py-4">
                <div className="text-sm text-muted-foreground mb-1">Gesamtsumme</div>
                <div className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Information Summary */}
        <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-4 lg:col-span-2 h-full shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Ihre Kontaktinformationen</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">Kundentyp</div>
                <div className="font-medium">
                  {inquiry.customerType === "private" ? "Privatkunde" : "Geschäftskunde"}
                </div>
              </div>
            </div>

            {inquiry.customerType === "business" && inquiry.companyName && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-0.5">Firma</div>
                  <div className="font-medium">{inquiry.companyName}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">Name</div>
                <div className="font-medium">
                  {inquiry.firstName} {inquiry.lastName}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">Adresse</div>
                <div className="font-medium">
                  {inquiry.street}
                  <br />
                  {inquiry.zipCode} {inquiry.city}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">E-Mail</div>
                <div className="font-medium break-all">{inquiry.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">Telefon</div>
                <div className="font-medium">{inquiry.phone}</div>
              </div>
            </div>

            {inquiry.message && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-0.5">Nachricht</div>
                  <div className="font-medium">{inquiry.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={onBackToList} 
          className="min-w-[250px] h-14 text-lg font-semibold hover-scale shadow-lg"
        >
          Zurück zur Fahrzeugliste
        </Button>
      </div>
    </div>
  );
};
