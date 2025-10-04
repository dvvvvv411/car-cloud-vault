import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronRight, Eye, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import LawyerContactCard from "@/components/LawyerContactCard";
import { InquiryForm } from "@/components/InquiryForm";
import kbsLogo from "@/assets/kbs_blue.png";
import demoVehicle from "@/assets/demo-vehicle.png";
import beschlussImage from "@/assets/beschluss.png";
import dekraLogoWhite from "@/assets/dekra-logo-white.png";
import { useVehicles, type Vehicle } from "@/hooks/useVehicles";
const Index = () => {
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
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const toggleVehicleSelection = (chassis: string) => {
    setSelectedVehicles(current => current.includes(chassis) ? current.filter(c => c !== chassis) : [...current, chassis]);
  };
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg" style={{
        color: "hsl(var(--text-secondary))"
      }}>Lade Fahrzeuge...</p>
      </div>;
  }
  const filteredAndSortedVehicles = vehicles.filter(vehicle => vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) || vehicle.chassis.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
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
            {/* Logo und Badge zusammen - oben ausgerichtet */}
            <div className="flex items-start gap-3">
              <img src={kbsLogo} alt="KBS Kanzlei Logo" className="h-16 md:h-20 lg:h-24 w-auto" />
              <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-3 md:px-4 py-1 md:py-1.5 font-semibold mt-1">
                Az: 502 IN 14/25
              </Badge>
            </div>
            
            <div className="hidden md:block h-16 lg:h-20 w-px bg-[hsl(var(--divider))]"></div>
            
            <div className="flex-1 relative min-h-[6rem] md:min-h-[8rem] w-full">
              {/* Beschluss image - rechts oben auf Desktop */}
              <div className="sm:absolute sm:top-0 sm:right-0 mb-4 sm:mb-0">
                {/* Drawer für Mobile/Tablet */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <div className="relative group lg:hidden">
                      <img src={beschlussImage} alt="Gerichtsbeschluss" className="h-[6rem] md:h-[7rem] w-auto cursor-pointer rounded border-2 border-border shadow-md hover:shadow-xl transition-all group-hover:scale-105" />
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
            }}>Übersicht an verfügbaren Positionen aus der Insolvenzmasse der TZ-West GmbH.</p>
            </div>
          </div>
        </div>

        {/* Conditional Content Area */}
        {!showInquiryForm ? <>
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

            {/* Modern Table - Desktop Only */}
            <div className="hidden lg:block animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
              <div className="overflow-x-auto">
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
                    {filteredAndSortedVehicles.map((vehicle, index) => {
                  const isSelected = selectedVehicles.includes(vehicle.chassis);
                  return <tr key={index} className={`border-b hover-lift cursor-pointer group transition-colors ${isSelected ? "bg-primary/5" : ""}`} style={{
                    borderColor: "hsl(var(--divider))",
                    animationDelay: `${0.3 + index * 0.05}s`
                  }} onClick={() => toggleVehicleSelection(vehicle.chassis)}>
                          <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleVehicleSelection(vehicle.chassis)} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted">
                              <img src={vehicle.image_url || demoVehicle} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="px-6 py-5">
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
                          <td className="px-6 py-5">
                            <span className="text-base font-mono" style={{
                        color: "hsl(var(--text-secondary))"
                      }}>
                              {vehicle.chassis}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-base" style={{
                        color: "hsl(var(--text-secondary))"
                      }}>
                              {vehicle.report_nr}
                            </span>
                          </td>
                          <td className="px-3 py-5">
                            <span className="text-base" style={{
                        color: "hsl(var(--text-secondary))"
                      }}>
                              {vehicle.first_registration}
                            </span>
                          </td>
                          <td className="px-3 py-5 text-right">
                            <span className="text-base font-medium" style={{
                        color: "hsl(var(--text-primary))"
                      }}>
                              {formatKilometers(vehicle.kilometers)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="text-lg font-semibold" style={{
                        color: "hsl(var(--text-primary))"
                      }}>
                              {formatPrice(vehicle.price)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button className="h-14 w-28 rounded-lg bg-[#018c4f] hover:bg-[#018c4f]/90 border-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#018c4f] focus-visible:ring-offset-2" onClick={e => {
                            e.stopPropagation();
                            if (vehicle.dekra_url) {
                              window.open(vehicle.dekra_url, "_blank");
                            }
                          }}>
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

              {/* Results Footer */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm" style={{
              color: "hsl(var(--text-tertiary))"
            }}>
                  {filteredAndSortedVehicles.length} von {vehicles.length} Fahrzeugen angezeigt
                </p>
              </div>
            </div>

            {/* Vehicle Cards - Mobile */}
            <div className="block lg:hidden space-y-4 mb-24 animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
              {filteredAndSortedVehicles.map((vehicle, index) => {
            const isSelected = selectedVehicles.includes(vehicle.chassis);
            return <div key={index} onClick={() => toggleVehicleSelection(vehicle.chassis)} className={`glassmorphism rounded-2xl overflow-hidden cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`} style={{
              animationDelay: `${0.3 + index * 0.05}s`
            }}>
                    {/* Image */}
                    <div className="relative h-48 bg-muted">
                      <img src={vehicle.image_url || demoVehicle} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                      {/* Checkbox overlay */}
                      <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleVehicleSelection(vehicle.chassis)} className="w-6 h-6 bg-background/80" />
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
                      <div className="text-2xl font-semibold" style={{
                color: "hsl(var(--text-primary))"
              }}>
                        {formatPrice(vehicle.price)}
                      </div>

                      {/* DEKRA Button */}
                      <Button className="w-full min-h-12 bg-[#018c4f] hover:bg-[#018c4f]/90 border-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center" onClick={e => {
                e.stopPropagation();
                if (vehicle.dekra_url) {
                  window.open(vehicle.dekra_url, "_blank");
                }
              }}>
                        <img src={dekraLogoWhite} alt="DEKRA" className="h-8 w-auto object-contain mr-2" />
                        <span>Bericht öffnen</span>
                      </Button>
                    </div>
                  </div>;
          })}
            </div>
          </> : <InquiryForm selectedVehicles={selectedVehicles} vehicles={vehicles} onRemoveVehicle={toggleVehicleSelection} onBack={() => setShowInquiryForm(false)} />}

        {/* Lawyer Contact Card - Always Visible, Desktop Only */}
        <LawyerContactCard />
      </div>

      {/* Fixed Info Box - No Binding Order */}
      {showInquiryForm && selectedVehicles.length > 0 && <div className="fixed bottom-[140px] md:bottom-[160px] left-0 right-0 z-40 px-4 md:px-6 lg:px-8">
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
      {selectedVehicles.length > 0 && <div className="fixed bottom-0 left-0 right-0 glassmorphism border-t shadow-lg animate-fade-in z-50" style={{
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
              {!showInquiryForm ? <Button size="lg" className="gap-2" onClick={() => setShowInquiryForm(true)}>
                  Weiter zur Anfrage
                  <ChevronRight className="h-5 w-5" />
                </Button> : <Button type="submit" form="inquiry-form" size="lg" className="gap-2">
                  Jetzt unverbindlich anfragen
                  <ChevronRight className="h-5 w-5" />
                </Button>}
            </div>
          </div>
        </div>}
    </div>;
};
export default Index;