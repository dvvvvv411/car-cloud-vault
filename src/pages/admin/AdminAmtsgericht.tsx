import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Package, Euro, MessageSquare, Loader2, Search, Building } from "lucide-react";
import { useInquiries, InquiryStatus } from "@/hooks/useInquiries";
import { useLogAmtsgerichtStatusChange } from "@/hooks/useAmtsgerichtHistory";
import { useToast } from "@/hooks/use-toast";
import { getBrandingColor } from "@/lib/utils";
import { InquiryStatusDropdown } from "@/components/admin/InquiryStatusDropdown";
import { InquiryNotesDialog } from "@/components/admin/InquiryNotesDialog";
import { InquiryDetailsDialog } from "@/components/admin/InquiryDetailsDialog";
import { AmtsgerichtHistoryDialog } from "@/components/admin/AmtsgerichtHistoryDialog";
import { 
  Pagination, PaginationContent, PaginationItem, PaginationLink, 
  PaginationNext, PaginationPrevious, PaginationEllipsis 
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const ALLOWED_STATUSES: InquiryStatus[] = ["Amtsgericht", "Amtsgericht Ready", "Kein Interesse"];

export default function AdminAmtsgericht() {
  const { data: inquiries = [], isLoading } = useInquiries();
  const logStatusChange = useLogAmtsgerichtStatusChange();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { toast } = useToast();

  const handleStatusChangeLog = (inquiry: any, oldStatus: InquiryStatus, newStatus: InquiryStatus) => {
    logStatusChange.mutate({
      inquiryId: inquiry.id,
      oldStatus,
      newStatus,
      inquiryName: `${inquiry.first_name} ${inquiry.last_name}`,
    });
  };

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

  const copyToClipboard = async (text: string, type: 'email' | 'phone' | 'name' | 'company') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert!",
        description: `${type === 'email' ? 'E-Mail' : type === 'phone' ? 'Telefonnummer' : type === 'name' ? 'Name' : 'Firmenname'} wurde in die Zwischenablage kopiert.`,
      });
    } catch (err) {
      toast({ title: "Fehler", description: "Kopieren fehlgeschlagen.", variant: "destructive" });
    }
  };

  const filteredInquiries = useMemo(() => {
    let filtered = inquiries.filter(i => i.status === "Amtsgericht" || i.status === "Amtsgericht Ready");

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inquiry) => {
        const fullName = `${inquiry.first_name} ${inquiry.last_name}`.toLowerCase();
        const email = inquiry.email.toLowerCase();
        const phone = inquiry.phone.toLowerCase();
        const company = inquiry.company_name?.toLowerCase() || "";
        return fullName.includes(query) || email.includes(query) || phone.includes(query) || company.includes(query);
      });
    }

    return filtered;
  }, [inquiries, searchQuery]);

  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInquiries, currentPage]);

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Amtsgericht</h1>
        <AmtsgerichtHistoryDialog />
      </div>
      <p className="text-muted-foreground mt-2 text-base">Anfragen mit Status "Amtsgericht"</p>
      </div>

      {filteredInquiries.length > 0 || searchQuery ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Suche nach Name, E-Mail, Telefon oder Unternehmen..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredInquiries.length} Anfragen
          </Badge>
        </div>
      ) : null}

      {filteredInquiries.length === 0 && !searchQuery ? (
        <Card className="modern-card">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">Keine Amtsgericht-Anfragen</p>
            <p className="text-sm text-muted-foreground">Anfragen mit dem Status "Amtsgericht" werden hier angezeigt</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="modern-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="modern-table">
                    <thead>
                      <tr className="hover:bg-transparent">
                        <th className="rounded-tl-lg">Datum</th>
                        <th>Name</th>
                        <th>Branding</th>
                        <th>E-Mail</th>
                        <th>Telefon</th>
                        <th className="text-center">Fzg.</th>
                        <th className="text-right">Preis</th>
                        <th>Notizen</th>
                        <th>Status</th>
                        <th className="text-center rounded-tr-lg">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInquiries.map((inquiry) => (
                        <tr key={inquiry.id} className="hover:bg-muted/20 transition-all duration-200">
                          <td className="text-muted-foreground whitespace-nowrap text-xs">
                            {formatDate(inquiry.created_at)}
                          </td>
                          <td>
                            <div 
                              className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => copyToClipboard(inquiry.last_name, 'name')}
                            >
                              {inquiry.first_name} {inquiry.last_name}
                            </div>
                            {inquiry.company_name && (
                              <div 
                                className="text-xs text-muted-foreground truncate max-w-[150px] mt-0.5 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => copyToClipboard(inquiry.company_name!, 'company')}
                              >
                                {inquiry.company_name}
                              </div>
                            )}
                          </td>
                          <td>
                            {inquiry.brandings?.lawyer_firm_name ? (
                              <Badge 
                                variant="outline" 
                                className={`${getBrandingColor(inquiry.brandings.lawyer_firm_name)} text-xs px-2 py-1 font-medium whitespace-nowrap`}
                              >
                                {inquiry.brandings.lawyer_firm_name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td 
                            className="truncate max-w-[180px] cursor-pointer hover:text-primary transition-colors text-muted-foreground"
                            onClick={() => copyToClipboard(inquiry.email, 'email')}
                          >
                            {inquiry.email}
                          </td>
                          <td 
                            className="whitespace-nowrap cursor-pointer hover:text-primary transition-colors text-muted-foreground"
                            onClick={() => copyToClipboard(inquiry.phone, 'phone')}
                          >
                            {inquiry.phone}
                          </td>
                          <td className="text-center">
                            <Badge variant="secondary" className="text-xs px-2 py-1 font-semibold">
                              {inquiry.selected_vehicles.length}
                            </Badge>
                          </td>
                          <td className="text-right whitespace-nowrap">
                            {inquiry.brandings?.branding_type === 'fahrzeuge' ? (
                              <>
                                <div className="font-bold text-primary">
                                  {formatPrice(calculateNettoFromBrutto(inquiry.total_price, inquiry.discount_percentage))}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">netto</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatPrice(inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100))} brutto
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="font-bold text-primary">
                                  {formatPrice(inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100))}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">netto</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {formatPrice(calculateBruttoFromNetto(inquiry.total_price, inquiry.discount_percentage))} brutto
                                </div>
                              </>
                            )}
                            {inquiry.discount_percentage && (
                              <div className="mt-1 flex justify-end">
                                <Badge variant="secondary" className="text-xs">
                                  -{inquiry.discount_percentage}% Rabatt
                                </Badge>
                              </div>
                            )}
                          </td>
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <InquiryNotesDialog inquiryId={inquiry.id} />
                          </td>
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <InquiryStatusDropdown
                              inquiryId={inquiry.id}
                              currentStatus={inquiry.status}
                              statusUpdatedAt={inquiry.status_updated_at}
                              allowedStatuses={ALLOWED_STATUSES}
                              onStatusChange={(oldS, newS) => handleStatusChangeLog(inquiry, oldS, newS)}
                            />
                          </td>
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <InquiryDetailsDialog inquiry={inquiry} readOnly allowedStatuses={ALLOWED_STATUSES} />
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
            {paginatedInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="modern-hover border-border/40">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p 
                        className="font-semibold cursor-pointer hover:text-primary transition-colors"
                        onClick={() => copyToClipboard(inquiry.last_name, 'name')}
                      >
                        {inquiry.first_name} {inquiry.last_name}
                      </p>
                      {inquiry.company_name && (
                        <p 
                          className="text-base text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => copyToClipboard(inquiry.company_name!, 'company')}
                        >
                          {inquiry.company_name}
                        </p>
                      )}
                      {inquiry.brandings?.lawyer_firm_name && (
                        <div className="flex items-center gap-2 mt-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <Badge 
                            variant="outline" 
                            className={`${getBrandingColor(inquiry.brandings.lawyer_firm_name)} text-xs px-2 py-1 font-medium`}
                          >
                            {inquiry.brandings.lawyer_firm_name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-base">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(inquiry.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {inquiry.selected_vehicles.length} Fahrzeuge
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <div>
                        {inquiry.brandings?.branding_type === 'fahrzeuge' ? (
                          <>
                            <div className="font-semibold text-primary">
                              {formatPrice(calculateNettoFromBrutto(inquiry.total_price, inquiry.discount_percentage))}
                              <span className="text-xs font-normal text-muted-foreground ml-1">netto</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100))} brutto
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-primary">
                              {formatPrice(inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100))}
                              <span className="text-xs font-normal text-muted-foreground ml-1">netto</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(calculateBruttoFromNetto(inquiry.total_price, inquiry.discount_percentage))} brutto
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => copyToClipboard(inquiry.email, 'email')}
                    >
                      <Mail className="h-4 w-4" />
                      {inquiry.email}
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => copyToClipboard(inquiry.phone, 'phone')}
                    >
                      <Phone className="h-4 w-4" />
                      {inquiry.phone}
                    </div>

                    <div className="pt-2 space-y-2">
                      <InquiryStatusDropdown
                        inquiryId={inquiry.id}
                        currentStatus={inquiry.status}
                        statusUpdatedAt={inquiry.status_updated_at}
                        allowedStatuses={ALLOWED_STATUSES}
                        onStatusChange={(oldS, newS) => handleStatusChangeLog(inquiry, oldS, newS)}
                      />
                      <div className="flex gap-2">
                        <InquiryNotesDialog inquiryId={inquiry.id} />
                        <InquiryDetailsDialog inquiry={inquiry} readOnly allowedStatuses={ALLOWED_STATUSES} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <p className="text-sm text-muted-foreground">
                Zeige {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredInquiries.length)} von {filteredInquiries.length} Anfragen
              </p>
              <Pagination>
                <PaginationContent className="gap-3">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <div className="flex items-center gap-1 mx-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <PaginationEllipsis />}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}
                  </div>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
