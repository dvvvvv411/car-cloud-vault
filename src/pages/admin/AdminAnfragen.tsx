import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin, Building2, User, Calendar, Package, Euro, MessageSquare, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useInquiries, useUpdateInquiryCallPriority, InquiryStatus } from "@/hooks/useInquiries";
import { useToast } from "@/hooks/use-toast";
import { InquiryStatusDropdown } from "@/components/admin/InquiryStatusDropdown";
import { InquiryNotesDialog } from "@/components/admin/InquiryNotesDialog";
import { InquiryDetailsDialog } from "@/components/admin/InquiryDetailsDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState, useMemo } from "react";

export default function AdminAnfragen() {
  const { data: inquiries = [], isLoading } = useInquiries();
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const updateCallPriority = useUpdateInquiryCallPriority();
  const { toast } = useToast();

  const STATUS_PRIORITY: Record<InquiryStatus, number> = {
    "Neu": 1,
    "Möchte RG/KV": 2,
    "RG/KV gesendet": 3,
    "Bezahlt": 4,
    "Exchanged": 5,
    "Kein Interesse": 6
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy(null);
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedInquiries = useMemo(() => {
    let sorted = [...inquiries];
    
    // Primary sort: Call priority (always first)
    sorted.sort((a, b) => {
      if (a.call_priority && !b.call_priority) return -1;
      if (!a.call_priority && b.call_priority) return 1;
      
      // Secondary sort: Status or other
      if (sortBy === 'status') {
        const priorityA = STATUS_PRIORITY[a.status];
        const priorityB = STATUS_PRIORITY[b.status];
        return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      }
      
      return 0;
    });
    
    return sorted;
  }, [inquiries, sortBy, sortOrder]);

  const handleCallPriorityChange = (inquiryId: string, checked: boolean) => {
    updateCallPriority.mutate(
      { inquiryId, callPriority: checked },
      {
        onError: () => {
          toast({
            title: "Fehler",
            description: "Call-Priorität konnte nicht aktualisiert werden.",
            variant: "destructive",
          });
        },
      }
    );
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

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert!",
        description: `${type === 'email' ? 'E-Mail' : 'Telefonnummer'} wurde in die Zwischenablage kopiert.`,
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Anfragen</h1>
        <p className="text-muted-foreground mt-2 text-base">Verwalten Sie Kundenanfragen</p>
      </div>

      {inquiries.length === 0 ? (
        <Card className="modern-card">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">Keine Anfragen vorhanden</p>
            <p className="text-sm text-muted-foreground">Anfragen werden hier angezeigt, sobald sie eingehen</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="modern-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="modern-table">
                    <thead>
                      <tr className="hover:bg-transparent">
                        <th className="rounded-tl-lg">Datum</th>
                        <th>Name</th>
                        <th>E-Mail</th>
                        <th>Telefon</th>
                        <th className="text-center">Fzg.</th>
                        <th className="text-right">Preis</th>
                        <th>Notizen</th>
                        <th 
                          className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Status</span>
                            {sortBy === 'status' ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </div>
                        </th>
                        <th className="text-center">Call</th>
                        <th className="text-center rounded-tr-lg">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedInquiries.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className={`transition-all duration-200 ${
                            inquiry.call_priority 
                              ? "bg-cyan-50/50 border-l-4 border-l-cyan-500 hover:bg-cyan-50" 
                              : "hover:bg-muted/20"
                          }`}
                        >
                          <td className="text-muted-foreground whitespace-nowrap text-xs">
                            {formatDate(inquiry.created_at)}
                          </td>
                          <td>
                            <div className="font-semibold text-foreground">{inquiry.first_name} {inquiry.last_name}</div>
                            {inquiry.company_name && (
                              <div className="text-xs text-muted-foreground truncate max-w-[150px] mt-0.5">
                                {inquiry.company_name}
                              </div>
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
                          <td className="text-right font-bold text-primary whitespace-nowrap">
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
                            <Checkbox
                              checked={inquiry.call_priority}
                              onCheckedChange={(checked) => 
                                handleCallPriorityChange(inquiry.id, checked as boolean)
                              }
                              aria-label="Als Anruf markieren"
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
            {sortedInquiries.map((inquiry) => (
              <Card 
                key={inquiry.id} 
                className={`modern-hover ${
                  inquiry.call_priority 
                    ? "bg-cyan-50/50 border-l-4 border-l-cyan-500" 
                    : "border-border/40"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">
                        {inquiry.first_name} {inquiry.last_name}
                      </p>
                      {inquiry.company_name && (
                        <p className="text-base text-muted-foreground">{inquiry.company_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      checked={inquiry.call_priority}
                      onCheckedChange={(checked) => 
                        handleCallPriorityChange(inquiry.id, checked as boolean)
                      }
                      aria-label="Als Anruf markieren"
                    />
                    <span className="text-base text-muted-foreground">Call-Priorität</span>
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
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Euro className="h-4 w-4" />
                      {formatPrice(inquiry.total_price)}
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
