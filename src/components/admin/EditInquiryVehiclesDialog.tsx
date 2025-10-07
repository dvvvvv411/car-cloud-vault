import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Search } from "lucide-react";
import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { Inquiry } from "@/hooks/useInquiries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditInquiryVehiclesDialogProps {
  inquiry: Inquiry;
}

export const EditInquiryVehiclesDialog = ({ inquiry }: EditInquiryVehiclesDialogProps) => {
  const { data: vehicles = [] } = useVehicles();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedChassis, setSelectedChassis] = useState<string[]>(
    inquiry.selected_vehicles.map(v => v.chassis)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (selectedVehicles: Vehicle[]) => {
      const vehicleData = selectedVehicles.map(v => ({
        chassis: v.chassis,
        brand: v.brand,
        model: v.model,
        price: v.price,
        kilometers: v.kilometers,
        first_registration: v.first_registration,
        report_nr: v.report_nr,
      }));
      
      const totalPrice = selectedVehicles.reduce((sum, v) => sum + Number(v.price), 0);
      
      const { error } = await supabase
        .from("inquiries")
        .update({ 
          selected_vehicles: vehicleData,
          total_price: totalPrice
        })
        .eq("id", inquiry.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Erfolg",
        description: "Fahrzeuge erfolgreich aktualisiert",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Fahrzeuge konnten nicht aktualisiert werden",
        variant: "destructive",
      });
      console.error("Error updating vehicles:", error);
    }
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.report_nr.toLowerCase().includes(query) ||
      vehicle.chassis.toLowerCase().includes(query)
    );
  });

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      const aSelected = selectedChassis.includes(a.chassis);
      const bSelected = selectedChassis.includes(b.chassis);
      
      // Selected vehicles first
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Then sort alphabetically by brand and model
      const aName = `${a.brand} ${a.model}`;
      const bName = `${b.brand} ${b.model}`;
      return aName.localeCompare(bName, 'de');
    });
  }, [filteredVehicles, selectedChassis]);

  const handleSelectAll = () => {
    setSelectedChassis(filteredVehicles.map(v => v.chassis));
  };

  const handleDeselectAll = () => {
    setSelectedChassis([]);
  };

  const handleToggleVehicle = (chassis: string) => {
    setSelectedChassis(prev => 
      prev.includes(chassis) 
        ? prev.filter(c => c !== chassis)
        : [...prev, chassis]
    );
  };

  const handleSave = () => {
    const selectedVehicles = vehicles.filter(v => 
      selectedChassis.includes(v.chassis)
    );
    updateMutation.mutate(selectedVehicles);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Fahrzeuge bearbeiten</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Suche nach Marke, Modell, DEKRA-Nr oder Fahrgestellnummer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleSelectAll} variant="outline" size="sm">
              Alle auswählen
            </Button>
            <Button onClick={handleDeselectAll} variant="outline" size="sm">
              Alle abwählen
            </Button>
            <Badge variant="secondary">
              {selectedChassis.length} / {vehicles.length} ausgewählt
            </Badge>
            {selectedChassis.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                Gesamt: {formatPrice(
                  vehicles
                    .filter(v => selectedChassis.includes(v.chassis))
                    .reduce((sum, v) => sum + Number(v.price), 0)
                )}
              </Badge>
            )}
          </div>
          
          {/* Vehicle List */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 space-y-2">
              {filteredVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Keine Fahrzeuge gefunden
                </p>
              ) : (
                sortedVehicles.map((vehicle) => {
                  const isSelected = selectedChassis.includes(vehicle.chassis);
                  return (
                  <div 
                    key={vehicle.chassis} 
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleToggleVehicle(vehicle.chassis)}
                  >
                    <Checkbox 
                      checked={selectedChassis.includes(vehicle.chassis)}
                      onCheckedChange={() => handleToggleVehicle(vehicle.chassis)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Fahrzeug</span>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">DEKRA-Nr</span>
                        <p className="font-medium text-xs">{vehicle.report_nr}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Chassis</span>
                        <p className="font-medium text-xs truncate">{vehicle.chassis}</p>
                      </div>
                      <div className="text-right md:text-left">
                        <span className="text-muted-foreground text-xs">Preis</span>
                        <p className="font-semibold">{formatPrice(vehicle.price)}</p>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Save Button */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || selectedChassis.length === 0}
          >
            {updateMutation.isPending ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
