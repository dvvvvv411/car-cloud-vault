import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Building2, User, Calendar, Package, Euro, MessageSquare, Loader2 } from "lucide-react";
import { useInquiries } from "@/hooks/useInquiries";
import { InquiryStatusDropdown } from "@/components/admin/InquiryStatusDropdown";
import { InquiryNotesDialog } from "@/components/admin/InquiryNotesDialog";
import { InquiryDetailsDialog } from "@/components/admin/InquiryDetailsDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function AdminAnfragen() {
  const { data: inquiries = [], isLoading } = useInquiries();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yy HH:mm", { locale: de });
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
                        <th className="text-left p-2 font-semibold text-xs">Datum</th>
                        <th className="text-left p-2 font-semibold text-xs">Name</th>
                        <th className="text-left p-2 font-semibold text-xs">E-Mail</th>
                        <th className="text-left p-2 font-semibold text-xs">Telefon</th>
                        <th className="text-center p-2 font-semibold text-xs">Fzg.</th>
                        <th className="text-right p-2 font-semibold text-xs">Preis</th>
                        <th className="text-left p-2 font-semibold text-xs">Notizen</th>
                        <th className="text-left p-2 font-semibold text-xs">Status</th>
                        <th className="text-center p-2 font-semibold text-xs">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(inquiry.created_at)}
                          </td>
                          <td className="p-2 text-xs">
                            <div className="font-medium">{inquiry.first_name} {inquiry.last_name}</div>
                            {inquiry.company_name && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {inquiry.company_name}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-xs truncate max-w-[150px]">{inquiry.email}</td>
                          <td className="p-2 text-xs whitespace-nowrap">{inquiry.phone}</td>
                          <td className="p-2 text-center">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {inquiry.selected_vehicles.length}
                            </Badge>
                          </td>
                          <td className="p-2 text-xs text-right font-semibold text-primary whitespace-nowrap">
                            {formatPrice(inquiry.total_price)}
                          </td>
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <InquiryNotesDialog inquiryId={inquiry.id} />
                          </td>
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <InquiryStatusDropdown
                              inquiryId={inquiry.id}
                              currentStatus={inquiry.status}
                              statusUpdatedAt={inquiry.status_updated_at}
                            />
                          </td>
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <InquiryDetailsDialog inquiry={inquiry} />
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
              <Card key={inquiry.id} className="hover:border-primary/50 transition-colors">
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
                  </div>
                  
                  <div className="space-y-3 text-sm">
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

                    <div className="pt-2 space-y-2">
                      <InquiryStatusDropdown
                        inquiryId={inquiry.id}
                        currentStatus={inquiry.status}
                        statusUpdatedAt={inquiry.status_updated_at}
                      />
                      <div className="flex gap-2">
                        <InquiryNotesDialog inquiryId={inquiry.id} />
                        <InquiryDetailsDialog inquiry={inquiry} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
