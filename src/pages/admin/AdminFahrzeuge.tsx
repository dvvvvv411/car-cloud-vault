import { useState, useMemo } from "react";
import { useFahrzeugeVehicles, FahrzeugeVehicle } from "@/hooks/useFahrzeugeVehicles";
import { useFahrzeugeBrandings } from "@/hooks/useFahrzeugeBrandings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Car, Zap } from "lucide-react";
import { FahrzeugeVehicleForm } from "@/components/admin/FahrzeugeVehicleForm";
import { QuickAddVehicleDialog } from "@/components/admin/QuickAddVehicleDialog";
import { FahrzeugeVehicleFormData } from "@/lib/validation/fahrzeugeVehicleSchema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminFahrzeuge() {
  const { data: vehicles, isLoading, refetch } = useFahrzeugeVehicles();
  const { data: brandings = [] } = useFahrzeugeBrandings();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<FahrzeugeVehicle | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaToJsonArray = (text?: string): string => {
    if (!text) return '[]';
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    return JSON.stringify(lines);
  };

  const uploadMultipleImages = async (
    files: File[], 
    vehicleId: string
  ): Promise<string[]> => {
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `${vehicleId}/vehicle_${i + 1}_${timestamp}_${random}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('fahrzeuge-vehicle-images')
        .upload(fileName, file, { upsert: false });
      
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('fahrzeuge-vehicle-images')
        .getPublicUrl(fileName);
      
      urls.push(data.publicUrl);
    }
    
    return urls;
  };

  const handleCreate = async (
    data: FahrzeugeVehicleFormData, 
    vehiclePhotos?: File[]
  ) => {
    setIsSubmitting(true);
    try {
      const { data: newVehicle, error: vehicleError } = await supabase
        .from("fahrzeuge_vehicles")
        .insert([{
          brand: data.brand,
          model: data.model,
          fin: data.fin,
          laufleistung: data.laufleistung,
          erstzulassung: data.erstzulassung,
          preis: data.preis,
          leistung_kw: data.leistung_kw || null,
          leistung_ps: data.leistung_ps || null,
          motor_antrieb: data.motor_antrieb || null,
          farbe: data.farbe || null,
          innenausstattung: data.innenausstattung || null,
          tueren: data.tueren || null,
          sitze: data.sitze || null,
          hubraum: data.hubraum || null,
          garantie: data.garantie || null,
          highlights: textareaToJsonArray(data.highlights),
          assistenzsysteme: textareaToJsonArray(data.assistenzsysteme),
          multimedia: textareaToJsonArray(data.multimedia),
          technik_sicherheit: textareaToJsonArray(data.technik_sicherheit),
          interieur: textareaToJsonArray(data.interieur),
          exterieur: textareaToJsonArray(data.exterieur),
          sonstiges: textareaToJsonArray(data.sonstiges),
          vehicle_photos: [],
        }])
        .select()
        .single();

      if (vehicleError) throw vehicleError;
      if (!newVehicle) throw new Error("Fahrzeug konnte nicht erstellt werden");

      // Upload images
      let photoUrls: string[] = [];
      if (vehiclePhotos && vehiclePhotos.length > 0) {
        photoUrls = await uploadMultipleImages(vehiclePhotos, newVehicle.id);
        
        const { error: updateError } = await supabase
          .from("fahrzeuge_vehicles")
          .update({ vehicle_photos: JSON.stringify(photoUrls) })
          .eq("id", newVehicle.id);
        
        if (updateError) throw updateError;
      }

      // Create branding associations
      const brandingInserts = data.branding_ids.map(brandingId => ({
        vehicle_id: newVehicle.id,
        branding_id: brandingId
      }));

      const { error: brandingError } = await supabase
        .from("fahrzeuge_vehicle_brandings")
        .insert(brandingInserts);

      if (brandingError) throw brandingError;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich erstellt.",
      });
      
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast({
        title: "Fehler",
        description: "Fahrzeug konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (
    data: FahrzeugeVehicleFormData, 
    vehiclePhotos?: File[]
  ) => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      let finalPhotoUrls = selectedVehicle.vehicle_photos || [];

      if (vehiclePhotos && vehiclePhotos.length > 0) {
        const newUrls = await uploadMultipleImages(vehiclePhotos, selectedVehicle.id);
        finalPhotoUrls = [...finalPhotoUrls, ...newUrls];
      }

      const { error: updateError } = await supabase
        .from("fahrzeuge_vehicles")
        .update({
          brand: data.brand,
          model: data.model,
          fin: data.fin,
          laufleistung: data.laufleistung,
          erstzulassung: data.erstzulassung,
          preis: data.preis,
          leistung_kw: data.leistung_kw || null,
          leistung_ps: data.leistung_ps || null,
          motor_antrieb: data.motor_antrieb || null,
          farbe: data.farbe || null,
          innenausstattung: data.innenausstattung || null,
          tueren: data.tueren || null,
          sitze: data.sitze || null,
          hubraum: data.hubraum || null,
          garantie: data.garantie || null,
          highlights: textareaToJsonArray(data.highlights),
          assistenzsysteme: textareaToJsonArray(data.assistenzsysteme),
          multimedia: textareaToJsonArray(data.multimedia),
          technik_sicherheit: textareaToJsonArray(data.technik_sicherheit),
          interieur: textareaToJsonArray(data.interieur),
          exterieur: textareaToJsonArray(data.exterieur),
          sonstiges: textareaToJsonArray(data.sonstiges),
          vehicle_photos: JSON.stringify(finalPhotoUrls),
        })
        .eq("id", selectedVehicle.id);

      if (updateError) throw updateError;

      // Update branding associations
      await supabase
        .from("fahrzeuge_vehicle_brandings")
        .delete()
        .eq("vehicle_id", selectedVehicle.id);

      const brandingInserts = data.branding_ids.map(brandingId => ({
        vehicle_id: selectedVehicle.id,
        branding_id: brandingId
      }));

      const { error: brandingError } = await supabase
        .from("fahrzeuge_vehicle_brandings")
        .insert(brandingInserts);

      if (brandingError) throw brandingError;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich aktualisiert.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      refetch();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Fehler",
        description: "Fahrzeug konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      if (selectedVehicle.vehicle_photos && Array.isArray(selectedVehicle.vehicle_photos)) {
        for (const photoUrl of selectedVehicle.vehicle_photos) {
          const urlParts = photoUrl.split('/');
          const pathStart = urlParts.findIndex(part => part === 'fahrzeuge-vehicle-images');
          if (pathStart !== -1) {
            const filePath = urlParts.slice(pathStart + 1).join('/');
            await supabase.storage
              .from('fahrzeuge-vehicle-images')
              .remove([filePath]);
          }
        }
      }

      const { error } = await supabase
        .from("fahrzeuge_vehicles")
        .delete()
        .eq("id", selectedVehicle.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich gelöscht.",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      refetch();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Fehler",
        description: "Fahrzeug konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km) + " km";
  };

  const getBrandingNames = (vehicle: FahrzeugeVehicle) => {
    if (!vehicle.branding_ids || vehicle.branding_ids.length === 0) return "Keine";
    return vehicle.branding_ids
      .map(id => {
        const branding = brandings.find(b => b.id === id);
        return branding ? branding.lawyer_name : "Unbekannt";
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fahrzeuge Verwaltung</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Fahrzeug hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Alle Fahrzeuge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marke</TableHead>
                  <TableHead>Modell</TableHead>
                  <TableHead>FIN</TableHead>
                  <TableHead>Laufleistung</TableHead>
                  <TableHead>Leistung (KW/PS)</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Brandings</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.brand}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell className="font-mono text-sm">{vehicle.fin}</TableCell>
                    <TableCell>{formatKilometers(vehicle.laufleistung)}</TableCell>
                    <TableCell>
                      {vehicle.leistung_kw && vehicle.leistung_ps 
                        ? `${vehicle.leistung_kw}/${vehicle.leistung_ps}` 
                        : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">{formatPrice(vehicle.preis)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getBrandingNames(vehicle)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Fahrzeuge vorhanden. Fügen Sie das erste Fahrzeug hinzu.
            </div>
          )}
        </CardContent>
      </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Neues Fahrzeug erstellen</DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Quick Add
                </Button>
              </div>
            </DialogHeader>
          <FahrzeugeVehicleForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            defaultValues={quickAddData}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <FahrzeugeVehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedVehicle(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Fahrzeug "{selectedVehicle?.brand} {selectedVehicle?.model}" wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVehicle(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QuickAddVehicleDialog
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onDataParsed={(data) => {
          setQuickAddData(data);
          setIsCreateDialogOpen(true);
        }}
      />
    </div>
  );
}
