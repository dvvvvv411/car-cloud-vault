import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin, Building2, User, Calendar, Package, Euro, MessageSquare, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Search, Eye, EyeOff, Filter, Building, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInquiries, useUpdateInquiryCallPriority, InquiryStatus } from "@/hooks/useInquiries";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getBrandingColor } from "@/lib/utils";
import { InquiryStatusDropdown } from "@/components/admin/InquiryStatusDropdown";
import { InquiryNotesDialog } from "@/components/admin/InquiryNotesDialog";
import { InquiryDetailsDialog } from "@/components/admin/InquiryDetailsDialog";
import { DekraNumbersDialog } from "@/components/admin/DekraNumbersDialog";
import { TransferButton } from "@/components/admin/TransferButton";
import { GenerateDocumentsDialog } from "@/components/admin/GenerateDocumentsDialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAnfragen() {
  const { data: inquiries = [], isLoading } = useInquiries();
  const { user } = useAuth();
  const isTransferAdmin = user?.email === "admin@admin.de";
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeinInteresse, setShowKeinInteresse] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<InquiryStatus[]>([]);
  const [selectedBrandings, setSelectedBrandings] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isAssigningSalutations, setIsAssigningSalutations] = useState(false);
  const updateCallPriority = useUpdateInquiryCallPriority();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const STATUS_PRIORITY: Record<InquiryStatus, number> = {
    "Neu": 1,
    "Möchte RG/KV": 2,
    "Amtsgericht": 3,
    "RG/KV gesendet": 4,
    "Bezahlt": 5,
    "Exchanged": 6,
    "Kein Interesse": 7
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

  const uniqueBrandings = useMemo(() => {
    const brandings = inquiries
      .filter(i => i.brandings?.company_name)
      .map(i => ({
        id: i.branding_id!,
        name: i.brandings!.company_name
      }));
    
    return Array.from(new Map(brandings.map(b => [b.id, b])).values());
  }, [inquiries]);

  const sortedInquiries = useMemo(() => {
    // First: Filter by selected statuses (if any selected)
    let filtered = inquiries;
    
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((inquiry) => selectedStatuses.includes(inquiry.status));
    } else {
      // Default behavior: Filter out "Kein Interesse" (if toggle is off)
      filtered = showKeinInteresse 
        ? inquiries.filter((inquiry) => inquiry.status === "Kein Interesse")
        : inquiries.filter((inquiry) => inquiry.status !== "Kein Interesse");
    }

    // Filter by selected brandings
    if (selectedBrandings.length > 0) {
      filtered = filtered.filter((inquiry) => 
        inquiry.branding_id && selectedBrandings.includes(inquiry.branding_id)
      );
    }
    
    // Second: Filter by search query
    filtered = filtered.filter((inquiry) => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const fullName = `${inquiry.first_name} ${inquiry.last_name}`.toLowerCase();
      const email = inquiry.email.toLowerCase();
      const phone = inquiry.phone.toLowerCase();
      const company = inquiry.company_name?.toLowerCase() || "";
      
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        company.includes(query)
      );
    });
    
    // Then: Sort
    let sorted = [...filtered];
    
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
  }, [inquiries, sortBy, sortOrder, searchQuery, showKeinInteresse, selectedStatuses, selectedBrandings]);

  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedInquiries.slice(startIndex, endIndex);
  }, [sortedInquiries, currentPage]);

  const totalPages = Math.ceil(sortedInquiries.length / ITEMS_PER_PAGE);

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

  const handleAssignSalutations = async () => {
    try {
      setIsAssigningSalutations(true);
      
      console.log('🚀 Starte KI-Anrede-Zuweisung...');
      
      toast({
        title: "KI-Zuweisung gestartet",
        description: "Die Anreden werden jetzt automatisch zugewiesen...",
      });

      const { data, error } = await supabase.functions.invoke('assign-salutations-to-inquiries', {
        body: {}
      });

      if (error) throw error;

      // Detaillierte Console Logs
      console.log(`✅ Erfolgreich ${data.updated} von ${data.total} Anreden zugewiesen`);
      
      if (data.assignments && data.assignments.length > 0) {
        console.log('\n📋 Details der Zuweisungen:');
        console.table(data.assignments);
        
        // Einzelne Zuweisungen ausgeben
        data.assignments.forEach((assignment: any) => {
          console.log(`  ✅ ${assignment.name} → ${assignment.salutation}`);
        });
      }
      
      if (data.errors > 0) {
        console.warn(`⚠️ ${data.errors} Fehler aufgetreten:`);
        console.table(data.errorDetails);
      }
      
      console.log('\n✨ KI-Zuweisung abgeschlossen');

      toast({
        title: "Erfolgreich abgeschlossen",
        description: `${data.updated} von ${data.total} Anreden wurden zugewiesen.`,
      });

      // Refresh inquiries
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });

    } catch (error) {
      console.error('❌ Error assigning salutations:', error);
      toast({
        title: "Fehler",
        description: "Die automatische Zuweisung ist fehlgeschlagen.",
        variant: "destructive",
      });
    } finally {
      setIsAssigningSalutations(false);
    }
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

  // Insolvenz: Netto → Brutto berechnen
  const calculateBruttoFromNetto = (nettoPrice: number, discountPercentage: number | null) => {
    const priceAfterDiscount = discountPercentage 
      ? nettoPrice * (1 - discountPercentage / 100)
      : nettoPrice;
    return priceAfterDiscount * 1.19;
  };

  // Fahrzeuge: Brutto → Netto berechnen
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
        description: `${
          type === 'email' ? 'E-Mail' : 
          type === 'phone' ? 'Telefonnummer' : 
          type === 'name' ? 'Name' : 
          'Firmenname'
        } wurde in die Zwischenablage kopiert.`,
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

      {inquiries.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Suche nach Name, E-Mail, Telefon oder Unternehmen..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Status Filter
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background z-50">
              <DropdownMenuLabel>Status auswählen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_PRIORITY) as InquiryStatus[]).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => {
                    setSelectedStatuses(prev =>
                      checked
                        ? [...prev, status]
                        : prev.filter(s => s !== status)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedStatuses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedStatuses([]);
                      setCurrentPage(1);
                    }}
                    className="text-destructive"
                  >
                    Filter zurücksetzen
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap w-full sm:w-auto">
                <Building className="h-4 w-4 mr-2" />
                Branding Filter
                {selectedBrandings.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedBrandings.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background z-50">
              <DropdownMenuLabel>Branding auswählen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueBrandings.map((branding) => (
                <DropdownMenuCheckboxItem
                  key={branding.id}
                  checked={selectedBrandings.includes(branding.id)}
                  onCheckedChange={(checked) => {
                    setSelectedBrandings(prev =>
                      checked
                        ? [...prev, branding.id]
                        : prev.filter(id => id !== branding.id)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {branding.name}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedBrandings.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedBrandings([]);
                      setCurrentPage(1);
                    }}
                    className="text-destructive"
                  >
                    Filter zurücksetzen
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignSalutations}
            disabled={isAssigningSalutations || selectedStatuses.length > 0}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            {isAssigningSalutations ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                KI weist zu...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Anreden zuweisen
              </>
            )}
          </Button>
          <Button
            variant={showKeinInteresse ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowKeinInteresse(!showKeinInteresse);
              setCurrentPage(1);
            }}
            disabled={selectedStatuses.length > 0}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            {showKeinInteresse ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                "Kein Interesse" ausblenden
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                "Kein Interesse" anzeigen ({inquiries.filter(i => i.status === "Kein Interesse").length})
              </>
            )}
          </Button>
        </div>
      )}

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
                        <th className="text-center">Details</th>
                        <th className="text-center rounded-tr-lg">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInquiries.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className={`transition-all duration-200 ${
                            inquiry.call_priority 
                              ? "bg-cyan-100 border-l-4 border-l-cyan-500 hover:bg-cyan-200" 
                              : "hover:bg-muted/20"
                          }`}
                        >
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
                            <DekraNumbersDialog 
                              reportNumbers={inquiry.selected_vehicles.map(v => v.report_nr || v.chassis || '-')}
                              trigger={
                                <Badge variant="secondary" className="text-xs px-2 py-1 font-semibold cursor-pointer hover:bg-secondary/80 transition-colors">
                                  {inquiry.selected_vehicles.length}
                                </Badge>
                              }
                            />
                          </td>
                          <td className="text-right whitespace-nowrap">
                            {inquiry.brandings?.branding_type === 'fahrzeuge' ? (
                              <>
                                {/* Fahrzeuge: Gespeicherter Preis ist Brutto → Netto berechnen */}
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
                                {/* Insolvenz: Gespeicherter Preis ist Netto → Brutto berechnen */}
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
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {isTransferAdmin && inquiry.status === "Möchte RG/KV" && (
                                <>
                                  <GenerateDocumentsDialog inquiry={inquiry} />
                                  <TransferButton inquiryId={inquiry.id} />
                                </>
                              )}
                            </div>
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
              <Card 
                key={inquiry.id} 
                className={`modern-hover ${
                  inquiry.call_priority 
                    ? "bg-cyan-100 border-l-4 border-l-cyan-500" 
                    : "border-border/40"
                }`}
              >
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
                    <DekraNumbersDialog 
                      reportNumbers={inquiry.selected_vehicles.map(v => v.report_nr || v.chassis || '-')}
                      trigger={
                        <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                          <Package className="h-4 w-4" />
                          {inquiry.selected_vehicles.length} Fahrzeuge
                        </div>
                      }
                    />
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-primary" />
                    <div>
                      {inquiry.brandings?.branding_type === 'fahrzeuge' ? (
                        <>
                          {/* Fahrzeuge: Brutto → Netto */}
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
                          {/* Insolvenz: Netto → Brutto */}
                          <div className="font-semibold text-primary">
                            {formatPrice(inquiry.total_price * (1 - (inquiry.discount_percentage || 0) / 100))}
                            <span className="text-xs font-normal text-muted-foreground ml-1">netto</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(calculateBruttoFromNetto(inquiry.total_price, inquiry.discount_percentage))} brutto
                          </div>
                        </>
                      )}
                      {inquiry.discount_percentage && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          -{inquiry.discount_percentage}% Rabatt
                        </Badge>
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
                      />
                  <div className="flex gap-2">
                    <InquiryNotesDialog inquiryId={inquiry.id} />
                    <InquiryDetailsDialog inquiry={inquiry} />
                    {isTransferAdmin && inquiry.status === "Möchte RG/KV" && (
                      <>
                        <GenerateDocumentsDialog inquiry={inquiry} />
                        <TransferButton inquiryId={inquiry.id} />
                      </>
                    )}
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
                Zeige {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedInquiries.length)} von {sortedInquiries.length} Anfragen
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
                      .filter(page => {
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <PaginationEllipsis />
                          )}
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
