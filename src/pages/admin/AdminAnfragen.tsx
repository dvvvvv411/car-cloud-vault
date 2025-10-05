import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Building2, User, Calendar, Package, Euro, MessageSquare, Loader2, FileText } from "lucide-react";
import { useInquiries, type Inquiry } from "@/hooks/useInquiries";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function AdminAnfragen() {
  const { data: inquiries = [], isLoading } = useInquiries();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy, HH:mm", { locale: de });
  };

  const handleRowClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Neu", variant: "default" as const },
      processing: { label: "In Bearbeitung", variant: "secondary" as const },
      completed: { label: "Abgeschlossen", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Anfragen</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Kundenanfragen</p>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-center">
              Noch keine Anfragen vorhanden.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-sm">Datum</th>
                        <th className="text-left p-4 font-semibold text-sm">Name</th>
                        <th className="text-left p-4 font-semibold text-sm">E-Mail</th>
                        <th className="text-left p-4 font-semibold text-sm">Telefon</th>
                        <th className="text-center p-4 font-semibold text-sm">Fahrzeuge</th>
                        <th className="text-right p-4 font-semibold text-sm">Gesamtpreis</th>
                        <th className="text-left p-4 font-semibold text-sm">Branding</th>
                        <th className="text-center p-4 font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          onClick={() => handleRowClick(inquiry)}
                          className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDate(inquiry.created_at)}
                          </td>
                          <td className="p-4 text-sm font-medium">
                            {inquiry.first_name} {inquiry.last_name}
                            {inquiry.company_name && (
                              <div className="text-xs text-muted-foreground">{inquiry.company_name}</div>
                            )}
                          </td>
                          <td className="p-4 text-sm">{inquiry.email}</td>
                          <td className="p-4 text-sm">{inquiry.phone}</td>
                          <td className="p-4 text-center">
                            <Badge variant="secondary">{inquiry.selected_vehicles.length}</Badge>
                          </td>
                          <td className="p-4 text-sm text-right font-semibold text-primary">
                            {formatPrice(inquiry.total_price)}
                          </td>
                          <td className="p-4 text-sm">
                            {inquiry.brandings?.company_name || "—"}
                          </td>
                          <td className="p-4 text-center">
                            {getStatusBadge(inquiry.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                onClick={() => handleRowClick(inquiry)}
                className="cursor-pointer hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">
                        {inquiry.first_name} {inquiry.last_name}
                      </p>
                      {inquiry.company_name && (
                        <p className="text-sm text-muted-foreground">{inquiry.company_name}</p>
                      )}
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(inquiry.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {inquiry.selected_vehicles.length} Fahrzeuge
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Euro className="h-4 w-4" />
                      {formatPrice(inquiry.total_price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Anfrage Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status & Date */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {getStatusBadge(selectedInquiry.status)}
                  <p className="text-sm text-muted-foreground">
                    Eingegangen: {formatDate(selectedInquiry.created_at)}
                  </p>
                </div>

                <Separator />

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kundendaten
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">
                        {selectedInquiry.first_name} {selectedInquiry.last_name}
                      </p>
                    </div>

                    {selectedInquiry.company_name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Unternehmen</p>
                        <p className="font-medium">{selectedInquiry.company_name}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Kundentyp</p>
                      <p className="font-medium">
                        {selectedInquiry.customer_type === "business" ? "Geschäftlich" : "Privat"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        E-Mail
                      </p>
                      <p className="font-medium">{selectedInquiry.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefon
                      </p>
                      <p className="font-medium">{selectedInquiry.phone}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Adresse
                      </p>
                      <p className="font-medium">
                        {selectedInquiry.street}<br />
                        {selectedInquiry.zip_code} {selectedInquiry.city}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Branding Info */}
                {selectedInquiry.brandings && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Branding
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="font-medium">{selectedInquiry.brandings.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Az: {selectedInquiry.brandings.case_number}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Selected Vehicles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ausgewählte Fahrzeuge ({selectedInquiry.selected_vehicles.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedInquiry.selected_vehicles.map((vehicle, index) => (
                      <div
                        key={vehicle.chassis}
                        className="bg-muted/50 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">FIN: {vehicle.chassis}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            EZ: {vehicle.first_registration} • {new Intl.NumberFormat("de-DE").format(vehicle.kilometers)} km
                          </p>
                        </div>
                        <p className="font-semibold text-primary">{formatPrice(vehicle.price)}</p>
                      </div>
                    ))}

                    {/* Total Price */}
                    <div className="bg-primary/10 rounded-lg p-4 flex justify-between items-center border border-primary/20">
                      <p className="font-semibold text-lg">Gesamtpreis:</p>
                      <p className="font-bold text-primary text-xl">
                        {formatPrice(selectedInquiry.total_price)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      Alle Preise exkl. MwSt.
                    </p>
                  </div>
                </div>

                {/* Message */}
                {selectedInquiry.message && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Nachricht
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
