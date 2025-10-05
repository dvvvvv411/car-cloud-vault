import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ChevronDown, StickyNote, Car, Copy } from "lucide-react";
import { Inquiry } from "@/hooks/useInquiries";
import { useInquiryNotes } from "@/hooks/useInquiryNotes";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getUserColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InquiryDetailsDialogProps {
  inquiry: Inquiry;
}

export const InquiryDetailsDialog = ({ inquiry }: InquiryDetailsDialogProps) => {
  const { data: notes = [], isLoading: notesLoading } = useInquiryNotes(inquiry.id);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
  };

  const copyReportNumbers = async () => {
    const reportNumbers = inquiry.selected_vehicles
      .map(vehicle => vehicle.report_nr)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(reportNumbers);
      toast({
        title: "Kopiert!",
        description: "DEKRA-Nummern wurden in die Zwischenablage kopiert.",
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
          <Eye className="h-3 w-3 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anfragedetails</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Kundeninformationen</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Kundentyp:</span>
                <p className="font-medium">{inquiry.customer_type === "private" ? "Privatkunde" : "Geschäftskunde"}</p>
              </div>
              {inquiry.company_name && (
                <div>
                  <span className="text-muted-foreground">Firma:</span>
                  <p className="font-medium">{inquiry.company_name}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{inquiry.first_name} {inquiry.last_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">E-Mail:</span>
                <p className="font-medium">{inquiry.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefon:</span>
                <p className="font-medium">{inquiry.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Adresse:</span>
                <p className="font-medium">{inquiry.street}, {inquiry.zip_code} {inquiry.city}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Branding Information */}
          {inquiry.brandings && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Branding-Informationen</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Firma:</span>
                    <p className="font-medium">{inquiry.brandings.company_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fallnummer:</span>
                    <p className="font-medium">{inquiry.brandings.case_number}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Selected Vehicles */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Ausgewählte Fahrzeuge</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={copyReportNumbers}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  DEKRA-Nummern kopieren
                </Button>
                <Badge variant="outline" className="text-sm">
                  {inquiry.selected_vehicles.length} {inquiry.selected_vehicles.length === 1 ? 'Fahrzeug' : 'Fahrzeuge'}
                </Badge>
                <Badge variant="secondary" className="text-sm font-semibold">
                  {formatPrice(inquiry.total_price)}
                </Badge>
              </div>
            </div>
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full group text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                <span>Details anzeigen</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <div className="space-y-3">
                  {inquiry.selected_vehicles.map((vehicle, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fahrzeug:</span>
                          <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">DEKRA-Nr:</span>
                          <p className="font-medium text-xs">{vehicle.report_nr}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fahrgestellnummer:</span>
                          <p className="font-medium text-xs">{vehicle.chassis}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Erstzulassung:</span>
                          <p className="font-medium">{vehicle.first_registration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kilometer:</span>
                          <p className="font-medium">{vehicle.kilometers.toLocaleString("de-DE")} km</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preis:</span>
                          <p className="font-medium">{formatPrice(vehicle.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Separator />

          {/* Message */}
          {inquiry.message && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Nachricht</h3>
                <p className="text-sm whitespace-pre-wrap p-3 bg-muted rounded-lg">{inquiry.message}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Meta Information */}
          <div>
            <h3 className="font-semibold mb-3">Weitere Informationen</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Erstellt am:</span>
                <p className="font-medium">{formatDate(inquiry.created_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{inquiry.status}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Notizen</h3>
              <Badge variant="outline" className="text-xs">{notes.length}</Badge>
            </div>
            {notesLoading ? (
              <p className="text-sm text-muted-foreground">Lade Notizen...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">Keine Notizen vorhanden</p>
            ) : (
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${getUserColor(note.user_email).replace('bg-', 'bg-').replace(' text-', ' ').split(' ')[0]}`}></span>
                          {note.user_email && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {note.user_email}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
