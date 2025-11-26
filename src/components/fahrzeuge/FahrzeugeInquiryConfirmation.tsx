import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { FahrzeugeVehicle } from "@/hooks/useFahrzeugeVehicles";
import type { InquiryFormData } from "@/lib/validation/inquirySchema";

interface InquiryConfirmationProps {
  inquiry: InquiryFormData;
  vehicles: FahrzeugeVehicle[];
  totalPrice: number;
  onBackToList: () => void;
}

export const InquiryConfirmation = ({
  inquiry,
  vehicles,
  totalPrice,
  onBackToList,
}: InquiryConfirmationProps) => {
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);

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
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-scale-in" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Anfrage erfolgreich versendet!</h1>
        <p className="text-muted-foreground">
          Vielen Dank für Ihre Anfrage. Der Verkäufer wird sich in Kürze bei Ihnen melden.
        </p>
      </div>

      {/* Vehicles Summary */}
      <Card className="p-6 mb-6">
        {/* Desktop: Normal Header */}
        <h2 className="hidden md:block text-xl font-semibold mb-4">Angefragte Fahrzeuge</h2>
        
        {/* Mobile: Collapsible Header */}
        <Collapsible open={isVehiclesOpen} onOpenChange={setIsVehiclesOpen} className="md:hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <h2 className="text-xl font-semibold">Angefragte Fahrzeuge</h2>
            <ChevronDown 
              className={`h-5 w-5 transition-transform duration-200 ${isVehiclesOpen ? 'rotate-180' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-3 mb-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-4">
                  <div className="font-medium text-lg mb-2">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FIN:</span>
                      <span>{vehicle.fin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erstzulassung:</span>
                      <span>{vehicle.erstzulassung}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Laufleistung:</span>
                      <span>{formatKilometers(vehicle.laufleistung)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Preis:</span>
                      <span>{formatPrice(vehicle.preis)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Marke & Modell</th>
                  <th className="text-left py-2 px-2">FIN</th>
                  <th className="text-left py-2 px-2">Erstzulassung</th>
                  <th className="text-left py-2 px-2">Laufleistung</th>
                  <th className="text-right py-2 px-2">Preis</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <div className="font-medium">{vehicle.brand}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                    </td>
                    <td className="py-3 px-2 text-sm">{vehicle.fin}</td>
                    <td className="py-3 px-2 text-sm">{vehicle.erstzulassung}</td>
                    <td className="py-3 px-2 text-sm">{formatKilometers(vehicle.laufleistung)}</td>
                    <td className="py-3 px-2 text-right font-semibold">{formatPrice(vehicle.preis)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Price - Always visible */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Gesamtsumme</div>
              <div className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information Summary */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Ihre Kontaktinformationen</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-muted-foreground mb-0.5">Kundentyp</div>
            <div className="font-medium">
              {inquiry.customerType === "private" ? "Privatkunde" : "Geschäftskunde"}
            </div>
          </div>

          {inquiry.customerType === "business" && inquiry.companyName && (
            <div>
              <div className="text-sm text-muted-foreground mb-0.5">Firma</div>
              <div className="font-medium">{inquiry.companyName}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground mb-0.5">Name</div>
            <div className="font-medium">
              {inquiry.firstName} {inquiry.lastName}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-0.5">Adresse</div>
            <div className="font-medium">
              {inquiry.street}
              <br />
              {inquiry.zipCode} {inquiry.city}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-0.5">E-Mail</div>
            <div className="font-medium">{inquiry.email}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-0.5">Telefon</div>
            <div className="font-medium">{inquiry.phone}</div>
          </div>

          {inquiry.message && (
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground mb-0.5">Nachricht</div>
              <div className="font-medium">{inquiry.message}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onBackToList} className="min-w-[200px]">
          Zurück zur Fahrzeugliste
        </Button>
      </div>
    </div>
  );
};
