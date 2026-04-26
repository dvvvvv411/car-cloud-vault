import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ChevronDown, StickyNote, Car, User, MessageSquare, Wallet, Calendar, Building2 } from "lucide-react";
import { Inquiry, InquiryStatus } from "@/hooks/useInquiries";
import { useInquiryNotes } from "@/hooks/useInquiryNotes";
import { useVehicles } from "@/hooks/useVehicles";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getUserColor } from "@/lib/utils";
import { DekraNumbersDialog } from "./DekraNumbersDialog";
import { CustomerInfoDialog } from "./CustomerInfoDialog";
import { EditCustomerInfoDialog } from "./EditCustomerInfoDialog";
import { EditInquiryVehiclesDialog } from "./EditInquiryVehiclesDialog";
import { AddNoteButton } from "./AddNoteButton";
import { InquiryStatusDropdown } from "./InquiryStatusDropdown";
import { DiscountButton } from "./DiscountButton";

interface InquiryDetailsDialogProps {
  inquiry: Inquiry;
  readOnly?: boolean;
  allowedStatuses?: InquiryStatus[];
}

const SectionLabel = ({ icon: Icon, children, actions }: { icon: React.ElementType; children: React.ReactNode; actions?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
      <Icon className="h-3 w-3" />
      {children}
    </div>
    {actions && <div className="flex items-center gap-1">{actions}</div>}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex gap-2 items-baseline min-w-0">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-16 flex-shrink-0">{label}</span>
    <span className="text-xs font-medium truncate" title={typeof children === 'string' ? children : undefined}>{children}</span>
  </div>
);

export const InquiryDetailsDialog = ({ inquiry, readOnly = false, allowedStatuses }: InquiryDetailsDialogProps) => {
  const { data: notes = [], isLoading: notesLoading } = useInquiryNotes(inquiry.id);
  const { data: vehicles = [] } = useVehicles();

  const getReportNumber = (chassis: string) => {
    const vehicle = vehicles.find(v => v.chassis === chassis);
    return vehicle?.report_nr || chassis;
  };

  const reportNumbers = inquiry.selected_vehicles.map(v =>
    v.report_nr || getReportNumber(v.chassis)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
  };

  const formatDateShort = (dateString: string) => {
    return format(new Date(dateString), "dd.MM. HH:mm", { locale: de });
  };

  const calculateBruttoFromNetto = (nettoPrice: number, discountPercentage: number | null) => {
    const priceAfterDiscount = discountPercentage
      ? nettoPrice * (1 - discountPercentage / 100)
      : nettoPrice;
    return priceAfterDiscount * 1.19;
  };

  const calculateNettoFromBrutto = (bruttoPrice: number, discountPercentage: number | null) => {
    const priceAfterDiscount = discountPercentage
      ? bruttoPrice * (1 - discountPercentage / 100)
      : bruttoPrice;
    return priceAfterDiscount / 1.19;
  };

  const isFahrzeuge = inquiry.brandings?.branding_type === 'fahrzeuge';

  const finalPrice = isFahrzeuge
    ? inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100)
    : calculateBruttoFromNetto(inquiry.total_price, inquiry.discount_percentage);
  const nettoPrice = isFahrzeuge
    ? calculateNettoFromBrutto(inquiry.total_price, inquiry.discount_percentage)
    : inquiry.total_price;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
          <Eye className="h-3 w-3 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base">Anfragedetails</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 rounded-lg border bg-card/50 text-xs mb-3">
          <InquiryStatusDropdown
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
            statusUpdatedAt={inquiry.status_updated_at}
            allowedStatuses={allowedStatuses}
          />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(inquiry.created_at)}</span>
          </div>
          {inquiry.brandings && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="font-medium text-foreground">{inquiry.brandings.company_name}</span>
              {inquiry.brandings.case_number && (
                <span>· AZ {inquiry.brandings.case_number}</span>
              )}
            </div>
          )}
          {!readOnly && (
            <div className="ml-auto flex items-center gap-2">
              {inquiry.discount_granted_at && (
                <span className="text-[10px] text-muted-foreground">
                  Rabatt: {formatDate(inquiry.discount_granted_at)}
                </span>
              )}
              <DiscountButton
                inquiryId={inquiry.id}
                currentDiscount={inquiry.discount_percentage}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Customer Information */}
          <div className="rounded-lg border bg-card/50 p-3">
            <SectionLabel
              icon={User}
              actions={
                <>
                  {!readOnly && <EditCustomerInfoDialog inquiry={inquiry} />}
                  <CustomerInfoDialog inquiry={inquiry} />
                </>
              }
            >
              Kunde
            </SectionLabel>
            <div className="space-y-1">
              <Field label="Typ">{inquiry.customer_type === "private" ? "Privatkunde" : "Geschäftskunde"}</Field>
              {inquiry.company_name && <Field label="Firma">{inquiry.company_name}</Field>}
              <Field label="Name">{`${inquiry.first_name} ${inquiry.last_name}`}</Field>
              <Field label="E-Mail">{inquiry.email}</Field>
              <Field label="Telefon">{inquiry.phone}</Field>
              <Field label="Adresse">{`${inquiry.street}, ${inquiry.zip_code} ${inquiry.city}`}</Field>
            </div>
          </div>

          {/* Selected Vehicles */}
          <div className="rounded-lg border bg-card/50 p-3">
            <SectionLabel
              icon={Car}
              actions={
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    {inquiry.selected_vehicles.length} {inquiry.selected_vehicles.length === 1 ? 'Fzg' : 'Fzg'}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                    {formatPrice(inquiry.total_price)}
                  </Badge>
                  {!readOnly && <EditInquiryVehiclesDialog inquiry={inquiry} />}
                  {!readOnly && <DekraNumbersDialog reportNumbers={reportNumbers} />}
                </>
              }
            >
              Fahrzeuge
            </SectionLabel>
            <div className="space-y-1">
              {inquiry.selected_vehicles.map((vehicle, index) => {
                const reportNr = vehicle.report_nr || getReportNumber(vehicle.chassis);
                const summary = `${vehicle.brand} ${vehicle.model} · DEKRA ${reportNr} · ${vehicle.kilometers.toLocaleString("de-DE")} km · ${formatPrice(vehicle.price)}`;
                return (
                  <div
                    key={index}
                    className="text-xs truncate text-foreground/90 flex items-center gap-1.5"
                    title={summary}
                  >
                    <span className="text-muted-foreground">·</span>
                    <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                    <span className="text-muted-foreground">· DEKRA {reportNr}</span>
                    <span className="text-muted-foreground">· {vehicle.kilometers.toLocaleString("de-DE")} km</span>
                    <span className="text-muted-foreground">· {formatPrice(vehicle.price)}</span>
                  </div>
                );
              })}
            </div>
            <Collapsible defaultOpen={false} className="mt-2">
              <CollapsibleTrigger className="flex items-center gap-1 group text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                <span>Details</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {inquiry.selected_vehicles.map((vehicle, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Fahrzeug</span>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">DEKRA-Nr</span>
                        <p className="font-medium">{vehicle.report_nr || getReportNumber(vehicle.chassis)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">FIN</span>
                        <p className="font-medium truncate" title={vehicle.chassis}>{vehicle.chassis}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">EZ</span>
                        <p className="font-medium">{vehicle.first_registration}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Kilometer</span>
                        <p className="font-medium">{vehicle.kilometers.toLocaleString("de-DE")} km</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Preis</span>
                        <p className="font-medium">
                          {formatPrice(vehicle.price)}
                          <span className="text-[10px] text-muted-foreground ml-1">{isFahrzeuge ? 'brutto' : 'netto'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Message */}
          {inquiry.message && (
            <div className="rounded-lg border bg-card/50 p-3">
              <SectionLabel icon={MessageSquare}>Nachricht</SectionLabel>
              <p className="text-xs whitespace-pre-wrap max-h-24 overflow-auto text-foreground/90">{inquiry.message}</p>
            </div>
          )}

          {/* Total Price */}
          <div className={`rounded-lg border bg-card/50 p-3 ${!inquiry.message ? 'lg:col-span-2' : ''}`}>
            <SectionLabel icon={Wallet}>Gesamtpreis</SectionLabel>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-xl font-bold text-primary leading-tight">{formatPrice(finalPrice)}</p>
              <p className="text-[11px] text-muted-foreground">
                inkl. 19% MwSt.
                <span className="mx-1.5">·</span>
                Netto: {formatPrice(nettoPrice)}
                {inquiry.discount_percentage && (
                  <>
                    <span className="mx-1.5">·</span>
                    <span className="text-green-600 font-medium">{inquiry.discount_percentage}% Rabatt</span>
                    {!isFahrzeuge && (
                      <>
                        <span className="mx-1.5">·</span>
                        <span>Netto vor Rabatt: {formatPrice(inquiry.total_price)}</span>
                      </>
                    )}
                    {isFahrzeuge && (
                      <>
                        <span className="mx-1.5">·</span>
                        <span>Brutto vor Rabatt: {formatPrice(inquiry.total_price)}</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border bg-card/50 p-3 lg:col-span-2">
            <SectionLabel
              icon={StickyNote}
              actions={
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">{notes.length}</Badge>
                  <AddNoteButton inquiryId={inquiry.id} />
                </>
              }
            >
              Notizen
            </SectionLabel>
            {notesLoading ? (
              <p className="text-xs text-muted-foreground">Lade Notizen...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Notizen vorhanden</p>
            ) : (
              <ScrollArea className="h-[140px] pr-2">
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${getUserColor(note.user_email).split(' ')[0]}`}></span>
                          {note.user_email && (
                            <span className="text-[10px] font-medium text-muted-foreground truncate">
                              {note.user_email}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatDateShort(note.created_at)}
                        </p>
                      </div>
                      <p className="text-xs whitespace-pre-wrap">{note.note_text}</p>
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
