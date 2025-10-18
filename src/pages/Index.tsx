import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronRight, Eye, Phone, X, FileText, LogOut, LogIn, Shield, FileDown, Loader2 } from "lucide-react";
import { PasswordProtection } from "@/components/PasswordProtection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import LawyerContactCard from "@/components/LawyerContactCard";
import { InquiryForm } from "@/components/InquiryForm";
import { InquiryConfirmation } from "@/components/InquiryConfirmation";
import kbsLogo from "@/assets/kbs_blue.png";
import demoVehicle from "@/assets/demo-vehicle.png";
import beschlussImage from "@/assets/beschluss.png";
import dekraLogoWhite from "@/assets/dekra-logo-white.png";
import { useVehicles, type Vehicle } from "@/hooks/useVehicles";
import { useMyReservations } from "@/hooks/useLeadReservations";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { Branding } from "@/hooks/useBranding";

const ITEMS_PER_PAGE = 10;

interface IndexProps {
  branding?: Branding;
}

const Index = ({ branding }: IndexProps = {}) => {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const {
    data: vehicles = [],
    isLoading
  } = useVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vehicle | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc"
  });
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<any>(null);
  const [submittedVehicles, setSubmittedVehicles] = useState<Vehicle[]>([]);
  const [submittedTotalPrice, setSubmittedTotalPrice] = useState(0);
  const [isBeschlusskDrawerOpen, setIsBeschlusskDrawerOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [beschlussPdfDialogOpen, setBeschlussPdfDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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
    if (!isLoading && vehicles.length > 0 && isPasswordVerified) {
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
              element: '.tour-beschluss',
              popover: {
                title: 'Gerichtsbeschluss',
                description: 'Hier finden Sie den Gerichtsbeschluss zur Insolvenzmasse. Klicken Sie auf das Bild, um es in voller Größe anzuzeigen.',
                side: 'bottom',
                align: 'center'
              }
            },
            {
              element: window.innerWidth < 1024 ? '.tour-mobile-price' : '.tour-price-row',
              popover: {
                title: 'Preise',
                description: window.innerWidth < 1024 
                  ? 'Hier sehen Sie den Preis des Fahrzeugs. Alle Preise sind exkl. MwSt.' 
                  : 'Alle angezeigten Preise sind exkl. MwSt.',
                side: window.innerWidth < 1024 ? 'bottom' : 'right',
                align: 'center'
              }
            },
            {
              element: window.innerWidth < 1024 ? '.tour-mobile-selection' : '.tour-selection-row',
              popover: {
                title: 'Fahrzeugauswahl',
                description: window.innerWidth < 1024
                  ? 'Tippen Sie hier auf die Checkbox, um dieses Fahrzeug auszuwählen.'
                  : 'Wählen Sie hier die Fahrzeuge aus, an denen Sie interessiert sind, und senden Sie anschließend eine Anfrage ab.',
                side: window.innerWidth < 1024 ? 'bottom' : 'right',
                align: 'center'
              }
            }
          ]
        });
        
        driverObj.drive();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, vehicles, isPasswordVerified]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  // Helper function to get vehicle thumbnail
  const getVehicleThumbnail = (vehicle: Vehicle): string => {
    if (vehicle.vehicle_photos) {
      try {
        const parsed = JSON.parse(vehicle.vehicle_photos as string);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed[0];
        }
      } catch (e) {
        console.error('Error parsing vehicle_photos', e);
      }
    }
    // Fallback to old image_url or demo image
    return vehicle.image_url || demoVehicle;
  };

  const toggleVehicleSelection = (chassis: string) => {
    setSelectedVehicles(current => current.includes(chassis) ? current.filter(c => c !== chassis) : [...current, chassis]);
  };
  
  // Check if vehicle is reserved for this lead
  const isVehicleReserved = (chassis: string, reportNr: string) => {
    return myReservations.some(r => 
      r.vehicle_chassis === chassis || r.vehicle_chassis === reportNr
    );
  };
  
  const filteredAndSortedVehicles = vehicles.filter(vehicle => vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.chassis.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.report_nr.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
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
    setSelectedVehicles(filteredAndSortedVehicles.map(v => v.chassis));
  };
  const deselectAll = () => {
    setSelectedVehicles([]);
  };
  const handleSort = (key: keyof Vehicle) => {
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

  if (!isPasswordVerified) {
    return (
      <PasswordProtection 
        onSuccess={() => setIsPasswordVerified(true)} 
        branding={branding}
      />
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
  const totalPrice = selectedVehicles.reduce((sum, chassis) => {
    const vehicle = vehicles.find(v => v.chassis === chassis);
    return sum + (vehicle?.price || 0);
  }, 0);
  const allSelected = filteredAndSortedVehicles.length > 0 && filteredAndSortedVehicles.every(v => selectedVehicles.includes(v.chassis));
  const someSelected = selectedVehicles.length > 0 && !allSelected;
  return <div className="min-h-screen bg-background relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        {/* Modern Header with Logo - Always Visible */}
        <div className="mb-8 md:mb-10 lg:mb-12 animate-fade-in">

          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Logo und Badge */}
            <div className="flex items-start gap-3">
              <img src={branding?.kanzlei_logo_url || kbsLogo} alt="Kanzlei Logo" className="h-16 md:h-20 lg:h-24 w-auto" />
              {/* Badge - nur auf Mobile/Tablet sichtbar */}
              <Badge variant="secondary" className="lg:hidden text-xs sm:text-sm md:text-base px-3 md:px-4 py-1 md:py-1.5 font-semibold mt-1">
                {branding?.case_number || 'Az: 502 IN 14/25'}
              </Badge>
            </div>
            
            <div className="hidden md:block h-16 lg:h-20 w-px bg-[hsl(var(--divider))]"></div>
            
            <div className="flex-1 relative min-h-[6rem] md:min-h-[8rem] w-full">
              {/* Beschluss image - rechts oben auf Desktop */}
              <div className="sm:absolute sm:top-0 sm:right-0 mb-4 sm:mb-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-3">
                  {/* Badge - nur auf Desktop sichtbar */}
                  <Badge variant="secondary" className="hidden lg:flex text-base px-4 py-1.5 font-semibold lg:mt-1">
                    {branding?.case_number || 'Az: 502 IN 14/25'}
                  </Badge>
                  
                  <div className="flex flex-col tour-beschluss">
                    {branding?.court_decision_pdf_url ? (
                      // Wenn PDF vorhanden: Klick öffnet PDF-Dialog
                      <>
                        {/* Mobile/Tablet Button */}
                        <button
                          onClick={() => setBeschlussPdfDialogOpen(true)}
                          className="relative group lg:hidden w-full md:w-auto block"
                        >
                          <img src={beschlussImage} alt="Gerichtsbeschluss" className="h-[6rem] md:h-[7rem] w-full md:w-auto object-cover md:object-none cursor-pointer rounded border-2 border-border shadow-md hover:shadow-xl transition-all brightness-[0.85] md:brightness-100" />
                          
                          {/* Permanente Kennzeichnung nur auf Mobile */}
                          <div className="absolute inset-0 rounded bg-black/30 md:bg-transparent flex flex-col items-center justify-center pointer-events-none">
                            <FileText className="h-6 w-6 text-white md:hidden mb-1" />
                            <span className="text-white text-xs md:hidden font-medium">Gerichtsbeschluss</span>
                          </div>
                          
                          {/* Hover-Effekt (Eye) bleibt zusätzlich */}
                          <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center pointer-events-none">
                            <Eye className="h-8 md:h-10 w-8 md:w-10 text-white" />
                          </div>
                        </button>

                        {/* Desktop Button */}
                        <button
                          onClick={() => setBeschlussPdfDialogOpen(true)}
                          className="relative group hidden lg:block"
                        >
                          <img src={beschlussImage} alt="Gerichtsbeschluss" className="h-[8rem] w-auto cursor-pointer rounded border-2 border-border shadow-md hover:shadow-xl transition-all group-hover:scale-105" />
                          <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center pointer-events-none">
                            <Eye className="h-8 md:h-10 w-8 md:w-10 text-white" />
                          </div>
                        </button>
                      </>
                    ) : (
                      // Wenn keine PDF: Bild-Dialog wie bisher
                      <>
                        {/* Drawer für Mobile/Tablet */}
                        <Drawer open={isBeschlusskDrawerOpen} onOpenChange={setIsBeschlusskDrawerOpen}>
                          <DrawerTrigger asChild>
                            <div className="relative group lg:hidden w-full md:w-auto">
                              <img src={beschlussImage} alt="Gerichtsbeschluss" className="h-[6rem] md:h-[7rem] w-full md:w-auto object-cover md:object-none cursor-pointer rounded border-2 border-border shadow-md hover:shadow-xl transition-all brightness-[0.85] md:brightness-100" />
                              
                              {/* Permanente Kennzeichnung nur auf Mobile */}
                              <div className="absolute inset-0 rounded bg-black/30 md:bg-transparent flex flex-col items-center justify-center pointer-events-none">
                                <FileText className="h-6 w-6 text-white md:hidden mb-1" />
                                <span className="text-white text-xs md:hidden font-medium">Gerichtsbeschluss</span>
                              </div>
                              
                              {/* Hover-Effekt (Eye) bleibt zusätzlich */}
                              <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center pointer-events-none">
                                <Eye className="h-8 md:h-10 w-8 md:w-10 text-white" />
                              </div>
                            </div>
                          </DrawerTrigger>
                          <DrawerContent className="h-screen rounded-none mt-0 border-0 bg-black p-0">
                            <DrawerClose className="fixed top-4 right-4 z-[60] rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                              <X className="h-6 w-6" />
                            </DrawerClose>
                            <div className="h-full w-full flex items-center justify-center">
                              <img src={beschlussImage} alt="Gerichtsbeschluss" className="max-h-full max-w-full object-contain" />
                            </div>
                          </DrawerContent>
                        </Drawer>

                        {/* Dialog für Desktop */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative group hidden lg:block">
                              <img src={beschlussImage} alt="Gerichtsbeschluss" className="h-[8rem] w-auto cursor-pointer rounded border-2 border-border shadow-md hover:shadow-xl transition-all group-hover:scale-105" />
                              <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center pointer-events-none">
                                <Eye className="h-8 md:h-10 w-8 md:w-10 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                            <img src={beschlussImage} alt="Gerichtsbeschluss" className="w-full h-auto" />
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight" style={{
                color: "hsl(var(--text-primary))"
              }}>
                  Insolvenzmasse
                </h1>
              </div>
              <p className="text-base md:text-lg lg:text-xl" style={{
              color: "hsl(var(--text-secondary))"
            }}>Übersicht an verfügbaren Positionen aus der Insolvenzmasse der {branding?.company_name || 'TZ-West GmbH'}.</p>
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
                          <th className="text-left px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            Fahrgestell-Nr.
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            Bericht-Nr.
                          </th>
                          <th className="text-left px-3 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("first_registration")} className="hover:bg-transparent p-0 h-auto font-medium -ml-2" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Erstzulassung
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-right px-3 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("kilometers")} className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Kilometer
                              <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                            </Button>
                          </th>
                          <th className="text-right px-6 py-4 text-sm font-medium uppercase tracking-wider" style={{
                        color: "hsl(var(--text-tertiary))"
                      }}>
                            <Button variant="ghost" onClick={() => handleSort("price")} className="hover:bg-transparent p-0 h-auto font-medium -mr-2 ml-auto" style={{
                          color: "hsl(var(--text-tertiary))"
                        }}>
                              Einzelpreis
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
                      const isSelected = selectedVehicles.includes(vehicle.chassis);
                      const isReserved = isVehicleReserved(vehicle.chassis, vehicle.report_nr);
                      return <tr key={index} className={`h-[100px] border-b hover-lift cursor-pointer group transition-colors ${isSelected ? "bg-primary/5" : ""} ${isReserved ? "opacity-50 pointer-events-none" : ""}`} style={{
                        borderColor: "hsl(var(--divider))",
                        animationDelay: `${0.3 + index * 0.05}s`
                      }} onClick={() => !isReserved && toggleVehicleSelection(vehicle.chassis)}>
                              <td className={`px-6 py-0 align-middle ${index === 2 ? 'tour-selection-row' : ''}`} onClick={e => e.stopPropagation()}>
                                <Checkbox checked={isSelected} onCheckedChange={() => !isReserved && toggleVehicleSelection(vehicle.chassis)} disabled={isReserved} />
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
                                <div>
                                  <div className="font-medium text-base" style={{
                              color: "hsl(var(--text-primary))"
                            }}>
                                    {vehicle.brand}
                                  </div>
                                  <div className="text-base mt-0.5" style={{
                              color: "hsl(var(--text-secondary))"
                            }}>
                                    {vehicle.model}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-0 align-middle">
                                <span className="text-base font-mono" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.chassis}
                                </span>
                              </td>
                              <td className="px-6 py-0 align-middle">
                                <span className="text-base" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.report_nr}
                                </span>
                              </td>
                              <td className="px-3 py-0 align-middle">
                                <span className="text-base" style={{
                            color: "hsl(var(--text-secondary))"
                          }}>
                                  {vehicle.first_registration}
                                </span>
                              </td>
                              <td className="px-3 py-0 align-middle text-right">
                                <span className="text-base font-medium" style={{
                            color: "hsl(var(--text-primary))"
                          }}>
                                  {formatKilometers(vehicle.kilometers)}
                                </span>
                              </td>
                              <td className={`px-6 py-0 align-middle text-right ${index === 2 ? 'tour-price-row' : ''}`}>
                                <span className="text-lg font-semibold" style={{
                            color: "hsl(var(--text-primary))"
                          }}>
                                  {formatPrice(vehicle.price)}
                                </span>
                              </td>
                              <td className="px-6 py-0 align-middle text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      className="h-14 w-28 rounded-lg bg-[#018c4f] hover:bg-[#018c4f]/90 border-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#018c4f] focus-visible:ring-offset-2" 
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (vehicle.dekra_url) {
                                          setCurrentPdfUrl(vehicle.dekra_url);
                                          setPdfDialogOpen(true);
                                        }
                                      }}
                                      disabled={!vehicle.dekra_url}
                                    >
                                      <img src={dekraLogoWhite} alt="DEKRA" className="h-10 w-auto object-contain" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>DEKRA Bericht öffnen</p>
                                  </TooltipContent>
                                </Tooltip>
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
                const isSelected = selectedVehicles.includes(vehicle.chassis);
                const isReserved = isVehicleReserved(vehicle.chassis, vehicle.report_nr);
                return <div key={index} onClick={() => !isReserved && toggleVehicleSelection(vehicle.chassis)} className={`glassmorphism rounded-2xl overflow-hidden cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""} ${isReserved ? "opacity-60 pointer-events-none" : ""}`} style={{
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
                            <Checkbox checked={isSelected} onCheckedChange={() => !isReserved && toggleVehicleSelection(vehicle.chassis)} className="w-6 h-6 bg-background/80" disabled={isReserved} />
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
                    }}>{vehicle.first_registration}</span>
                            </div>
                            <div>
                              <span style={{
                      color: "hsl(var(--text-tertiary))"
                    }}>KM:</span>
                              <span className="ml-2 font-medium" style={{
                      color: "hsl(var(--text-primary))"
                    }}>{formatKilometers(vehicle.kilometers)}</span>
                            </div>
                            <div className="col-span-2">
                              <span style={{
                      color: "hsl(var(--text-tertiary))"
                    }}>Bericht-Nr.:</span>
                              <span className="ml-2 font-medium" style={{
                      color: "hsl(var(--text-primary))"
                    }}>{vehicle.report_nr}</span>
                            </div>
                          </div>

                          {/* Chassis Number */}
                          <div className="text-xs font-mono" style={{
                    color: "hsl(var(--text-tertiary))"
                  }}>
                            Fahrgestell: {vehicle.chassis}
                          </div>

                          {/* Price */}
                          <div className={`text-2xl font-semibold ${index === 0 ? 'tour-mobile-price' : ''}`} style={{
                    color: "hsl(var(--text-primary))"
                  }}>
                            {formatPrice(vehicle.price)}
                          </div>

                          {/* DEKRA Button */}
                          <Button 
                            className="w-full min-h-12 bg-[#018c4f] hover:bg-[#018c4f]/90 border-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center" 
                            onClick={e => {
                              e.stopPropagation();
                              if (vehicle.dekra_url) {
                                setCurrentPdfUrl(vehicle.dekra_url);
                                setPdfDialogOpen(true);
                              }
                            }}
                            disabled={!vehicle.dekra_url}
                          >
                            <img src={dekraLogoWhite} alt="DEKRA" className="h-8 w-auto object-contain mr-2" />
                            <span>Bericht öffnen</span>
                          </Button>
                        </div>
                      </div>;
              })}
                </div>
            </div>
          </> : showInquiryForm ? (
            <InquiryForm 
              selectedVehicles={selectedVehicles} 
              vehicles={vehicles} 
              onRemoveVehicle={toggleVehicleSelection} 
              onBack={() => setShowInquiryForm(false)} 
              onSuccess={(data, vehicles, totalPrice) => {
                setSubmittedInquiry(data);
                setSubmittedVehicles(vehicles);
                setSubmittedTotalPrice(totalPrice);
                setShowInquiryForm(false);
                setShowConfirmation(true);
              }}
              brandingId={branding?.id} 
            />
          ) : (
            <InquiryConfirmation
              inquiry={submittedInquiry!}
              vehicles={submittedVehicles}
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

        {/* Lawyer Contact Card - Always Visible, Desktop Only */}
        <LawyerContactCard 
          hideMobileButton={isBeschlusskDrawerOpen}
          lawyerName={branding?.lawyer_name}
          lawyerPhotoUrl={branding?.lawyer_photo_url || undefined}
          firmName={branding?.lawyer_firm_name}
          firmSubtitle={branding?.lawyer_firm_subtitle || undefined}
          addressStreet={branding?.lawyer_address_street}
          addressCity={branding?.lawyer_address_city}
          email={branding?.lawyer_email}
          phone={branding?.lawyer_phone}
          websiteUrl={branding?.lawyer_website_url}
        />
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
    </div>;
};
export default Index;