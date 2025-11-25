import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronRight, Eye, Phone, X, FileText, LogOut, LogIn, Shield, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import LawyerContactCard from "@/components/fahrzeuge/FahrzeugeLawyerContactCard";
import { InquiryForm } from "@/components/fahrzeuge/FahrzeugeInquiryForm";
import { InquiryConfirmation } from "@/components/fahrzeuge/FahrzeugeInquiryConfirmation";
import { BerichtContent } from "@/components/fahrzeuge/BerichtContent";
import kbsLogo from "@/assets/kbs_blue.png";
import demoVehicle from "@/assets/demo-vehicle.png";
import beschlussImage from "@/assets/beschluss.png";
import dekraLogoWhite from "@/assets/dekra-logo-white.png";
import { useFahrzeugeVehicles, type FahrzeugeVehicle } from "@/hooks/useFahrzeugeVehicles";
import { useMyReservations } from "@/hooks/useLeadReservations";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { Branding } from "@/hooks/useBranding";

const ITEMS_PER_PAGE = 10;

interface FahrzeugeIndexProps {
  branding?: Branding;
}

const FahrzeugeIndex = ({ branding }: FahrzeugeIndexProps = {}) => {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const {
    data: allVehicles = [],
    isLoading
  } = useFahrzeugeVehicles();
  
  // Filter vehicles by branding if provided
  const vehicles = branding 
    ? allVehicles.filter(v => v.branding_ids?.includes(branding.id))
    : allVehicles;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FahrzeugeVehicle | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc"
  });
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<any>(null);
  const [submittedVehicles, setSubmittedVehicles] = useState<FahrzeugeVehicle[]>([]);
  const [submittedTotalPrice, setSubmittedTotalPrice] = useState(0);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [beschlussPdfDialogOpen, setBeschlussPdfDialogOpen] = useState(false);
  const [berichtDialogOpen, setBerichtDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zustandsberichtDialogOpen, setZustandsberichtDialogOpen] = useState(false);
  const [selectedReportNr, setSelectedReportNr] = useState<string | null>(null);
  
  // Get leadId from localStorage
  const leadId = localStorage.getItem('leadId');
  const { data: myReservations = [] } = useMyReservations(leadId);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig.key, sortConfig.direction]);

  // Tour mode on every visit
  useEffect(() => {
    if (!isLoading && vehicles.length > 0) {
      const timer = setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          nextBtnText: 'Weiter',
          prevBtnText: 'Zurück',
          doneBtnText: 'Fertig',
          progressText: '{{current}} von {{total}}',
          allowClose: true,
          disableActiveInteraction: true,
          steps: [
            {
              element: window.innerWidth < 1280 ? undefined : '.tour-ansprechpartner',
              popover: {
                title: 'Ihr Ansprechpartner',
                description: 'Hier finden Sie die Kontaktdaten Ihres persönlichen Ansprechpartners. Bei Fragen können Sie ihn jederzeit kontaktieren.',
                side: 'left',
                align: 'center'
              }
            },
            {
              element: window.innerWidth < 1024 ? '.tour-mobile-price' : '.tour-price-row',
              popover: {
                title: 'Preise',
                description: window.innerWidth < 1024 
                  ? 'Hier sehen Sie den Preis des Fahrzeugs. Alle Preise sind inkl. MwSt.' 
                  : 'Alle angezeigten Preise verstehen sich inkl. MwSt.',
                side: window.innerWidth < 1024 ? 'bottom' : 'left',
                align: 'center'
              }
            },
            {
              element: window.innerWidth < 1024 ? '.tour-mobile-selection' : '.tour-selection-row',
              popover: {
                title: 'Fahrzeugauswahl',
                description: window.innerWidth < 1024
                  ? 'Tippen Sie hier auf die Checkbox, um Fahrzeuge auszuwählen.'
                  : 'Wählen Sie hier die Fahrzeuge aus, für die Sie sich interessieren. Sie können mehrere Fahrzeuge gleichzeitig auswählen.',
                side: window.innerWidth < 1024 ? 'bottom' : 'right',
                align: 'center'
              }
            },
            {
              element: window.innerWidth < 1024 ? '.tour-mobile-report' : '.tour-report-row',
              popover: {
                title: 'Fahrzeugbericht',
                description: window.innerWidth < 1024
                  ? 'Klicken Sie hier, um den detaillierten Fahrzeugbericht anzuzeigen.'
                  : 'Klicken Sie auf das Dokument-Icon, um den detaillierten Fahrzeugbericht mit allen technischen Daten und der Ausstattung anzuzeigen.',
                side: window.innerWidth < 1024 ? 'bottom' : 'left',
                align: 'center'
              }
            }
          ]
        });
        
        driverObj.drive();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, vehicles]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  // Helper function to get vehicle thumbnail
  const getVehicleThumbnail = (vehicle: FahrzeugeVehicle): string => {
    if (vehicle.vehicle_photos && Array.isArray(vehicle.vehicle_photos) && vehicle.vehicle_photos.length > 0) {
      return vehicle.vehicle_photos[0];
    }
    // Fallback to demo image
    return demoVehicle;
  };

  const toggleVehicleSelection = (fin: string) => {
    setSelectedVehicles(current => current.includes(fin) ? current.filter(c => c !== fin) : [...current, fin]);
  };
  
  // Check if vehicle is reserved for this lead
  const isVehicleReserved = (fin: string) => {
    return myReservations.some(r => 
      r.vehicle_chassis === fin
    );
  };
  
  const filteredAndSortedVehicles = vehicles.filter(vehicle => vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.fin.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex);

  const selectAll = () => {
    setSelectedVehicles(filteredAndSortedVehicles.map(v => v.fin));
  };
  const deselectAll = () => {
    setSelectedVehicles([]);
  };
  const handleSort = (key: keyof FahrzeugeVehicle) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };
  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km);
  };
  const totalPrice = selectedVehicles.reduce((sum, fin) => {
    const vehicle = vehicles.find(v => v.fin === fin);
    return sum + (vehicle?.preis || 0);
  }, 0);
  const allSelected = filteredAndSortedVehicles.length > 0 && filteredAndSortedVehicles.every(v => selectedVehicles.includes(v.fin));
  const someSelected = selectedVehicles.length > 0 && !allSelected;
  return <div className="min-h-screen bg-background relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        {/* Modern Header with 50/50 Split Layout (Desktop XL+) */}
        <div className="mb-8 md:mb-10 lg:mb-12 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
            
            {/* LINKE HÄLFTE (50%) - Logo, Divider, Titel, Text */}
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <img 
                src={branding?.kanzlei_logo_url || kbsLogo} 
                alt="Logo" 
                className="h-12 md:h-14 lg:h-16 w-auto" 
              />
              
              <div className="hidden md:block h-16 lg:h-20 w-px bg-[hsl(var(--divider))]"></div>
              
              <div className="flex-1">
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight" style={{
                    color: "hsl(var(--text-primary))"
                  }}>
                    Fahrzeuge
                  </h1>
                </div>
                <p className="text-base md:text-lg lg:text-xl" style={{
                  color: "hsl(var(--text-secondary))"
                }}>
                  Übersicht verfügbarer Fahrzeuge von {branding?.company_name || 'Autohändler'}, verwaltet und verkauft durch {branding?.lawyer_name || 'unseren Verkäufer'}.
                </p>
              </div>
            </div>

            {/* RECHTE HÄLFTE (50%) - Kontaktkarte integriert (nur Desktop XL+) */}
            <div className="hidden xl:block tour-ansprechpartner">
              <LawyerContactCard
                inlineHeaderMode={true}
                lawyerName={branding?.lawyer_name}
                lawyerPhotoUrl={branding?.lawyer_photo_url}
                firmName={branding?.lawyer_firm_name}
                firmSubtitle={branding?.lawyer_firm_subtitle}
                addressStreet={branding?.lawyer_address_street}
                addressCity={branding?.lawyer_address_city}
                email={branding?.lawyer_email}
                phone={branding?.lawyer_phone}
                websiteUrl={branding?.lawyer_website_url}
              />
            </div>
          </div>
        </div>

        {/* Conditional Content Area */}
        {!showInquiryForm && !showConfirmation ? <>
            {/* Glassmorphism Search Bar */}
            <div className="mb-6 md:mb-8 animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
              <div className="glassmorphism rounded-2xl p-3 md:p-4 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5" style={{
                color: "hsl(var(--text-tertiary))"
              }} />
                  <Input placeholder="Suche nach Marke, Modell..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 md:pl-12 h-10 md:h-12 text-sm md:text-base border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary" />
                </div>
              </div>
            </div>

            {/* Mobile Pagination - Below Search Bar */}
            {totalPages > 1 && (
              <div className="block lg:hidden relative z-40 bg-background/95 backdrop-blur-xl shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] rounded-2xl mb-6 animate-fade-in" style={{
                animationDelay: "0.15s"
              }}>
                <div className="px-4 py-6">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        if (totalPages > 5 && i === 4 && currentPage < totalPages - 2) {
                          return (
                            <PaginationItem key="ellipsis">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <p className="text-center text-sm mt-4" style={{
                    color: "hsl(var(--text-tertiary))"
                  }}>
                    Zeige {startIndex + 1}-{Math.min(endIndex, filteredAndSortedVehicles.length)} von {filteredAndSortedVehicles.length} Fahrzeugen
                  </p>
                </div>
              </div>
            )}

            {/* Modern Table - Desktop Only */}
            <div className="hidden lg:block animate-fade-in pb-[280px]" style={{
          animationDelay: "0.2s"
        }}>
              <div className="overflow-x-auto">
                {/* Fixed height wrapper to keep pagination position consistent */}
                <div className="min-h-[740px]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{
                      borderColor: "hsl(var(--divider))"
                    }}>
                          <th className="text-left px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Checkbox checked={allSelected} onCheckedChange={checked => {
                          if (checked) {
                            selectAll();
                          } else {
                            deselectAll();
                          }
                        }} className={someSelected ? "data-[state=checked]:bg-primary/50" : ""} />
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            Fahrzeug
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("model")} className="hover:bg-transparent p-0 h-auto font-medium -ml-2" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Modell
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-left px-4 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("leistung_kw")} className="hover:bg-transparent p-0 h-auto font-medium -ml-2" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Leistung (KW/PS)
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-right px-3 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("laufleistung")} className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Laufleistung
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-left px-3 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("erstzulassung")} className="hover:bg-transparent p-0 h-auto font-medium -ml-2" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Erstzulassung
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-left px-4 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            Farbe
                          </th>
                          <th className="text-right px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("preis")} className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Preis (inkl. MwSt.)
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-center px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            Bericht
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedVehicles.map((vehicle, index) => {
                      const isSelected = selectedVehicles.includes(vehicle.fin);
                      const isReserved = isVehicleReserved(vehicle.fin);
                      return <tr key={index} className={`h-[100px] border-b hover-lift cursor-pointer group transition-colors ${isSelected ? "bg-primary/5" : ""} ${isReserved ? "opacity-50 pointer-events-none" : ""}`} style={{
                        borderColor: "hsl(var(--divider))",
                        animationDelay: `${0.3 + index * 0.05}s`
                      }} onClick={() => !isReserved && toggleVehicleSelection(vehicle.fin)}>
                              <td className={`px-6 py-0 align-middle ${index === 0 ? 'tour-selection-row' : ''}`} onClick={e => e.stopPropagation()}>
                                <Checkbox checked={isSelected} onCheckedChange={() => !isReserved && toggleVehicleSelection(vehicle.fin)} disabled={isReserved} />
                              </td>
                              <td 
                                className="px-6 py-0 align-middle cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageUrl(getVehicleThumbnail(vehicle));
                                  setImageDialogOpen(true);
                                }}
                              >
                                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all">
                                  <img src={getVehicleThumbnail(vehicle)} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                                  {isReserved && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold tracking-wider">RESERVIERT</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-0 align-middle">
                                <span className="text-base font-medium" style={{
                              color: "hsl(var(--text-primary))"
                            }}>
                                  {vehicle.brand} {vehicle.model}
                                </span>
                              </td>
                              <td className="px-4 py-0 align-middle">
                                <span className="text-base" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.leistung_kw && vehicle.leistung_ps 
                                    ? `${vehicle.leistung_kw} KW / ${vehicle.leistung_ps} PS`
                                    : "-"
                                  }
                                </span>
                              </td>
                              <td className="px-3 py-0 align-middle text-right">
                                <span className="text-base font-medium" style={{
                            color: "hsl(var(--text-primary))"
                          }}>
                                  {formatKilometers(vehicle.laufleistung)}
                                </span>
                              </td>
                              <td className="px-3 py-0 align-middle">
                                <span className="text-base" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.erstzulassung}
                                </span>
                              </td>
                              <td className="px-4 py-0 align-middle">
                                <span className="text-sm" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.farbe || "-"}
                                </span>
                              </td>
                              <td className={`px-6 py-0 align-middle text-right ${index === 0 ? 'tour-price-row' : ''}`}>
                                <span className="text-lg font-semibold" style={{
                            color: "hsl(var(--text-primary))"
                          }}>
                                  {formatPrice(vehicle.preis)}
                                 </span>
                              </td>
                              <td className={`px-6 py-4 text-center align-middle ${index === 0 ? 'tour-report-row' : ''}`}>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedVehicleId(vehicle.id);
                                          setBerichtDialogOpen(true);
                                        }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto hover:bg-primary/10 transition-colors"
                                      >
                                        <FileText className="h-5 w-5 text-primary" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Bericht anzeigen</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>;
                    })}
                      </tbody>
                    </table>
                  </div>
                </div>

              {/* Desktop Pagination - Below table */}
              {totalPages > 1 && (
                <div className="mt-6 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] rounded-t-2xl">
                  <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6">
                    <Pagination>
                      <PaginationContent className="gap-1">
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        <div className="w-3" />
                        
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 7) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 4) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNumber = totalPages - 6 + i;
                          } else {
                            pageNumber = currentPage - 3 + i;
                          }
                          
                          if (totalPages > 7 && i === 6 && currentPage < totalPages - 3) {
                            return (
                              <PaginationItem key="ellipsis">
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <div className="w-3" />
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    
                    <p className="text-center text-sm mt-4" style={{
                      color: "hsl(var(--text-tertiary))"
                    }}>
                      Zeige {startIndex + 1}-{Math.min(endIndex, filteredAndSortedVehicles.length)} von {filteredAndSortedVehicles.length} Fahrzeugen
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Cards - Mobile */}
            <div className="block lg:hidden space-y-4 mb-8 animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
              {/* Fixed height wrapper to keep pagination position consistent */}
              <div>
              {paginatedVehicles.map((vehicle, index) => {
                const isSelected = selectedVehicles.includes(vehicle.fin);
                const isReserved = myReservations.some(r => r.vehicle_chassis === vehicle.fin);
                return <div key={index} onClick={() => !isReserved && toggleVehicleSelection(vehicle.fin)} className={`glassmorphism rounded-2xl overflow-hidden cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""} ${isReserved ? "opacity-60 pointer-events-none" : ""}`} style={{
                  animationDelay: `${0.3 + index * 0.05}s`
                }}>
                        {/* Image */}
                        <div className="relative h-48 bg-muted">
                          <img src={getVehicleThumbnail(vehicle)} alt={`${vehicle.brand} ${vehicle.model}`} className={`w-full h-full object-cover ${isReserved ? "brightness-50" : ""}`} />
                          {/* Reserved overlay */}
                          {isReserved && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold tracking-wider">RESERVIERT</span>
                            </div>
                          )}
                          {/* Checkbox overlay */}
                          <div className={`absolute top-3 right-3 ${index === 0 ? 'tour-mobile-selection' : ''}`} onClick={e => e.stopPropagation()}>
                            <Checkbox checked={isSelected} onCheckedChange={() => !isReserved && toggleVehicleSelection(vehicle.fin)} className="w-6 h-6 bg-background/80" disabled={isReserved} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          {/* Brand & Model */}
                          <div>
                            <h3 className="text-xl font-medium" style={{
                    color: "hsl(var(--text-primary))"
                  }}>{vehicle.brand}</h3>
                            <p className="text-lg" style={{
                    color: "hsl(var(--text-secondary))"
                  }}>{vehicle.model}</p>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span style={{
                      color: "hsl(var(--text-tertiary))"
                    }}>Erstzulassung:</span>
                              <span className="ml-2 font-medium" style={{
                      color: "hsl(var(--text-primary))"
                    }}>{vehicle.erstzulassung}</span>
                            </div>
                            <div>
                              <span style={{
                      color: "hsl(var(--text-tertiary))"
                    }}>KM:</span>
                              <span className="ml-2 font-medium" style={{
                      color: "hsl(var(--text-primary))"
                    }}>{formatKilometers(vehicle.laufleistung)}</span>
                            </div>
                          </div>

                          {/* FIN Number */}
                          <div className="text-xs font-mono" style={{
                    color: "hsl(var(--text-tertiary))"
                  }}>
                            FIN: {vehicle.fin}
                          </div>

                          {/* Price */}
                          <div className={`text-2xl font-semibold ${index === 0 ? 'tour-mobile-price' : ''}`} style={{
                    color: "hsl(var(--text-primary))"
                  }}>
                            {formatPrice(vehicle.preis)}
                          </div>
                          
                          {/* Bericht Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/bericht/${vehicle.id}`);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Bericht anzeigen
                          </Button>
                        </div>
                      </div>;
              })}
                </div>
            </div>
          </> : showInquiryForm ? (
            <InquiryForm 
              selectedVehicles={selectedVehicles} 
              vehicles={vehicles as any} 
              onRemoveVehicle={toggleVehicleSelection} 
              onBack={() => setShowInquiryForm(false)} 
              onSuccess={(data, vehicles, totalPrice) => {
                setSubmittedInquiry(data);
                setSubmittedVehicles(vehicles as any);
                setSubmittedTotalPrice(totalPrice);
                setShowInquiryForm(false);
                setShowConfirmation(true);
              }}
              brandingId={branding?.id} 
            />
          ) : (
            <InquiryConfirmation
              inquiry={submittedInquiry!}
              vehicles={submittedVehicles as any}
              totalPrice={submittedTotalPrice}
              onBackToList={() => {
                setShowConfirmation(false);
                setSelectedVehicles([]);
                setSubmittedInquiry(null);
                setSubmittedVehicles([]);
                setSubmittedTotalPrice(0);
              }}
            />
          )}
      </div>

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">DEKRA Bericht</DialogTitle>
          <div className="flex flex-col h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="bg-[#018c4f] p-2 rounded">
                  <FileDown className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">DEKRA Bericht</h3>
              </div>
              {currentPdfUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentPdfUrl, '_blank')}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Herunterladen
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              {currentPdfUrl && (
                <iframe
                  src={`${currentPdfUrl}#view=FitH`}
                  className="w-full h-full"
                  title="DEKRA Bericht"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gerichtsbeschluss PDF Viewer Dialog */}
      <Dialog open={beschlussPdfDialogOpen} onOpenChange={setBeschlussPdfDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">Gerichtsbeschluss</DialogTitle>
          <div className="flex flex-col h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Gerichtsbeschluss</h3>
              </div>
              {branding?.court_decision_pdf_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(branding.court_decision_pdf_url, '_blank')}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Herunterladen
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              {branding?.court_decision_pdf_url && (
                <iframe
                  src={`${branding.court_decision_pdf_url}#view=FitH`}
                  className="w-full h-full"
                  title="Gerichtsbeschluss"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog - Desktop Only */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-2">
          <DialogTitle className="sr-only">Fahrzeugbild</DialogTitle>
          {selectedImageUrl && (
            <img 
              src={selectedImageUrl} 
              alt="Fahrzeug" 
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Fixed Info Box - No Binding Order */}
      {showInquiryForm && selectedVehicles.length > 0 && <div className="hidden lg:block fixed bottom-[140px] md:bottom-[160px] left-0 right-0 z-40 px-4 md:px-6 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="glassmorphism rounded-2xl p-4 md:p-6 bg-accent/20 border-2 border-accent">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="rounded-full bg-accent/30 p-1.5 md:p-2 mt-0.5 flex-shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">
                    Keine verbindliche Bestellung
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Sie geben hiermit keine verbindliche Bestellung auf. Dies ist eine
                    unverbindliche Anfrage für die ausgewählten Positionen. Nach
                    Absenden der Anfrage wird sich unser Rechtsanwalt kostenlos mit
                    Ihnen in Verbindung setzen, um alle Details zu besprechen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Sticky Selection/Submit Footer - Always Visible */}
      {selectedVehicles.length > 0 && !showConfirmation && <div className="fixed bottom-0 left-0 right-0 glassmorphism border-t shadow-lg animate-fade-in z-50" style={{
      borderColor: "hsl(var(--divider))"
    }}>
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium" style={{
              color: "hsl(var(--text-primary))"
            }}>
                  {selectedVehicles.length} {selectedVehicles.length === 1 ? "Fahrzeug" : "Fahrzeuge"} ausgewählt
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-2xl font-semibold" style={{
                color: "hsl(var(--text-primary))"
              }}>
                    Gesamtbetrag: {formatPrice(totalPrice)}
                  </p>
                  <p className="text-sm" style={{
                color: "hsl(var(--text-tertiary))"
              }}>
                    Alle Preise exkl. MwSt.
                  </p>
                </div>
              </div>
              
              {/* Mobile: Navigation oder Submit Button */}
              <div className="lg:hidden w-full">
                {!showInquiryForm ? (
                  <Button 
                    type="button"
                    size="lg" 
                    className="gap-2 w-full h-14 md:h-16 text-base md:text-lg" 
                    onClick={() => setShowInquiryForm(true)}
                  >
                    Weiter zur Anfrage
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="rounded-full bg-accent/30 p-2.5 hover:bg-accent/50 transition-colors flex-shrink-0">
                          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-2rem)] max-w-md" side="top" align="end">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground text-sm">
                            Keine verbindliche Bestellung
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Sie geben hiermit keine verbindliche Bestellung auf. Dies ist eine
                            unverbindliche Anfrage für die ausgewählten Positionen. Nach
                            Absenden der Anfrage wird sich unser Rechtsanwalt kostenlos mit
                            Ihnen in Verbindung setzen, um alle Details zu besprechen.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button type="submit" form="inquiry-form" size="lg" className="gap-2 flex-1 h-14 md:h-16 text-base md:text-lg">
                      Jetzt unverbindlich anfragen
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Desktop: Standard Buttons */}
              <div className="hidden lg:block">
                {!showInquiryForm ? (
                  <Button 
                    type="button"
                    size="lg" 
                    className="gap-2 h-14 md:h-16 text-base md:text-lg" 
                    onClick={() => setShowInquiryForm(true)}
                  >
                    Weiter zur Anfrage
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button type="submit" form="inquiry-form" size="lg" className="gap-2 h-14 md:h-16 text-base md:text-lg">
                    Jetzt unverbindlich anfragen
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>}

        {/* Zustandsbericht Dialog */}
        <Dialog open={zustandsberichtDialogOpen} onOpenChange={setZustandsberichtDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] p-0">
            <DialogTitle className="sr-only">
              Zustandsbericht - Bericht-Nr. {selectedReportNr}
            </DialogTitle>
            <div className="flex flex-col h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-2 rounded">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">Zustandsbericht - Bericht-Nr. {selectedReportNr}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/zustandsbericht/${selectedReportNr}`, '_blank')}
                  className="gap-2"
                >
                  In neuem Tab öffnen
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                {selectedReportNr && (
                  <iframe
                    src={`/zustandsbericht/${selectedReportNr}`}
                    className="w-full h-full"
                    title={`Zustandsbericht ${selectedReportNr}`}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Beschluss PDF Dialog */}
        <Dialog open={beschlussPdfDialogOpen} onOpenChange={setBeschlussPdfDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] p-0">
            <DialogTitle className="sr-only">Gerichtsbeschluss</DialogTitle>
            <div className="flex flex-col h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-2 rounded">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">Gerichtsbeschluss</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(branding?.court_decision_pdf_url || '', '_blank')}
                  className="gap-2"
                >
                  In neuem Tab öffnen
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                {branding?.court_decision_pdf_url && (
                  <iframe
                    src={branding.court_decision_pdf_url}
                    className="w-full h-full"
                    title="Gerichtsbeschluss"
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bericht Dialog */}
        <Dialog open={berichtDialogOpen} onOpenChange={setBerichtDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            {selectedVehicleId && branding && (
              <BerichtContent vehicleId={selectedVehicleId} branding={branding} />
            )}
          </DialogContent>
        </Dialog>
    </div>;
};
export default FahrzeugeIndex;