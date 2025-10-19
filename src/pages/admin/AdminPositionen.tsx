import { useState } from "react";
import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Car, FileUp } from "lucide-react";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { DeleteVehicleDialog } from "@/components/admin/DeleteVehicleDialog";
import { BulkImageUpload } from "@/components/admin/BulkImageUpload";
import { VehicleFormData } from "@/lib/validation/vehicleSchema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPositionen() {
  const { data: vehicles, isLoading, refetch } = useVehicles();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImageUploadDialogOpen, setIsBulkImageUploadDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadMultipleImages = async (
    files: File[], 
    vehicleId: string, 
    type: 'vehicle' | 'detail',
    existingCount: number = 0
  ): Promise<string[]> => {
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `${vehicleId}/${type}_${existingCount + i + 1}_${timestamp}_${random}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, { upsert: false });
      
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);
      
      urls.push(data.publicUrl);
    }
    
    return urls;
  };

  // Helper: Convert textarea lines to JSON array
  const textareaToJsonArray = (text?: string): string => {
    if (!text) return '[]';
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    return JSON.stringify(lines);
  };

  // Helper: Convert bereifung structured fields to JSON array for database
  const convertBereifungToJson = (data: VehicleFormData): string => {
    const bereifungData = [];
    
    if (data.bereifung_vorne_links?.bezeichnung) {
      bereifungData.push({
        position: 'Vorne links',
        bezeichnung: data.bereifung_vorne_links.bezeichnung,
        art: data.bereifung_vorne_links.art || '',
        profiltiefe: data.bereifung_vorne_links.profiltiefe || ''
      });
    }
    
    if (data.bereifung_vorne_rechts?.bezeichnung) {
      bereifungData.push({
        position: 'Vorne rechts',
        bezeichnung: data.bereifung_vorne_rechts.bezeichnung,
        art: data.bereifung_vorne_rechts.art || '',
        profiltiefe: data.bereifung_vorne_rechts.profiltiefe || ''
      });
    }
    
    if (data.bereifung_hinten_links?.bezeichnung) {
      bereifungData.push({
        position: 'Hinten links',
        bezeichnung: data.bereifung_hinten_links.bezeichnung,
        art: data.bereifung_hinten_links.art || '',
        profiltiefe: data.bereifung_hinten_links.profiltiefe || ''
      });
    }
    
    if (data.bereifung_hinten_rechts?.bezeichnung) {
      bereifungData.push({
        position: 'Hinten rechts',
        bezeichnung: data.bereifung_hinten_rechts.bezeichnung,
        art: data.bereifung_hinten_rechts.art || '',
        profiltiefe: data.bereifung_hinten_rechts.profiltiefe || ''
      });
    }
    
    return JSON.stringify(bereifungData);
  };

  const handleCreate = async (
    data: VehicleFormData, 
    vehiclePhotos?: File[], 
    detailPhotos?: File[],
    finalVehiclePhotoUrls?: string[],
    finalDetailPhotoUrls?: string[]
  ) => {
    setIsSubmitting(true);
    try {
      // First create the vehicle entry
      const { data: newVehicle, error } = await supabase
        .from("vehicles")
        .insert([{
          brand: data.brand,
          model: data.model,
          chassis: data.chassis,
          report_nr: data.report_nr,
          first_registration: data.first_registration,
          kilometers: data.kilometers,
          price: data.price,
          vehicle_photos: [],
          detail_photos: [],
          aufbau: data.aufbau || null,
          kraftstoffart: data.kraftstoffart || null,
          motorart: data.motorart || null,
          leistung: data.leistung || null,
          getriebeart: data.getriebeart || null,
          farbe: data.farbe || null,
          gesamtgewicht: data.gesamtgewicht || null,
          hubraum: data.hubraum || null,
          anzahl_tueren: data.anzahl_tueren || null,
          anzahl_sitzplaetze: data.anzahl_sitzplaetze || null,
          faelligkeit_hu: data.faelligkeit_hu || null,
          polster_typ: data.polster_typ || null,
          bemerkungen: data.bemerkungen || null,
          wartung_datum: data.wartung_datum || null,
          wartung_kilometerstand: data.wartung_kilometerstand || null,
          serienausstattung: textareaToJsonArray(data.serienausstattung),
          sonderausstattung: textareaToJsonArray(data.sonderausstattung),
          optische_schaeden: textareaToJsonArray(data.optische_schaeden),
          innenraum_zustand: textareaToJsonArray(data.innenraum_zustand),
          bereifung: convertBereifungToJson(data),
        }])
        .select()
        .single();

      if (error) throw error;

      // Upload files if provided
      let vehiclePhotoUrls: string[] = [];
      let detailPhotoUrls: string[] = [];

      if (vehiclePhotos && vehiclePhotos.length > 0 && newVehicle) {
        vehiclePhotoUrls = await uploadMultipleImages(vehiclePhotos, newVehicle.id, 'vehicle', 0);
      }

      if (detailPhotos && detailPhotos.length > 0 && newVehicle) {
        detailPhotoUrls = await uploadMultipleImages(detailPhotos, newVehicle.id, 'detail', 0);
      }

      // Update vehicle with file URLs
      if ((vehiclePhotoUrls.length > 0 || detailPhotoUrls.length > 0) && newVehicle) {
        const { error: updateError } = await supabase
          .from("vehicles")
          .update({
            vehicle_photos: vehiclePhotoUrls,
            detail_photos: detailPhotoUrls,
          })
          .eq('id', newVehicle.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich hinzugefügt.",
      });
      
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fahrzeug konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (
    data: VehicleFormData, 
    vehiclePhotos?: File[], 
    detailPhotos?: File[],
    finalVehiclePhotoUrls?: string[],
    finalDetailPhotoUrls?: string[]
  ) => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      // Use final URLs if provided (from VehicleForm after deletions/reordering)
      // Otherwise fall back to existing DB data
      let vehiclePhotoUrls: string[] = finalVehiclePhotoUrls !== undefined 
        ? finalVehiclePhotoUrls 
        : (Array.isArray(selectedVehicle.vehicle_photos) ? selectedVehicle.vehicle_photos : []);

      let detailPhotoUrls: string[] = finalDetailPhotoUrls !== undefined 
        ? finalDetailPhotoUrls 
        : (Array.isArray(selectedVehicle.detail_photos) ? selectedVehicle.detail_photos : []);

      // Upload new photos if provided
      if (vehiclePhotos && vehiclePhotos.length > 0) {
        const newUrls = await uploadMultipleImages(
          vehiclePhotos, 
          selectedVehicle.id, 
          'vehicle',
          vehiclePhotoUrls.length
        );
        vehiclePhotoUrls = [...vehiclePhotoUrls, ...newUrls];
      }

      if (detailPhotos && detailPhotos.length > 0) {
        const newUrls = await uploadMultipleImages(
          detailPhotos, 
          selectedVehicle.id, 
          'detail',
          detailPhotoUrls.length
        );
        detailPhotoUrls = [...detailPhotoUrls, ...newUrls];
      }

      // Update vehicle
      const { error } = await supabase
        .from("vehicles")
        .update({
          brand: data.brand,
          model: data.model,
          chassis: data.chassis,
          report_nr: data.report_nr,
          first_registration: data.first_registration,
          kilometers: data.kilometers,
          price: data.price,
          vehicle_photos: vehiclePhotoUrls,
          detail_photos: detailPhotoUrls,
          aufbau: data.aufbau || null,
          kraftstoffart: data.kraftstoffart || null,
          motorart: data.motorart || null,
          leistung: data.leistung || null,
          getriebeart: data.getriebeart || null,
          farbe: data.farbe || null,
          gesamtgewicht: data.gesamtgewicht || null,
          hubraum: data.hubraum || null,
          anzahl_tueren: data.anzahl_tueren || null,
          anzahl_sitzplaetze: data.anzahl_sitzplaetze || null,
          faelligkeit_hu: data.faelligkeit_hu || null,
          polster_typ: data.polster_typ || null,
          bemerkungen: data.bemerkungen || null,
          wartung_datum: data.wartung_datum || null,
          wartung_kilometerstand: data.wartung_kilometerstand || null,
          serienausstattung: textareaToJsonArray(data.serienausstattung),
          sonderausstattung: textareaToJsonArray(data.sonderausstattung),
          optische_schaeden: textareaToJsonArray(data.optische_schaeden),
          innenraum_zustand: textareaToJsonArray(data.innenraum_zustand),
          bereifung: convertBereifungToJson(data),
        })
        .eq("id", selectedVehicle.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich aktualisiert.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      refetch();
    } catch (error) {
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
      // Delete vehicle photos from storage
      if (selectedVehicle.vehicle_photos && Array.isArray(selectedVehicle.vehicle_photos)) {
        for (const photoUrl of selectedVehicle.vehicle_photos) {
          const path = photoUrl.split('/vehicle-images/')[1];
          if (path) {
            await supabase.storage.from('vehicle-images').remove([path]);
          }
        }
      }

      // Delete detail photos from storage
      if (selectedVehicle.detail_photos && Array.isArray(selectedVehicle.detail_photos)) {
        for (const photoUrl of selectedVehicle.detail_photos) {
          const path = photoUrl.split('/vehicle-images/')[1];
          if (path) {
            await supabase.storage.from('vehicle-images').remove([path]);
          }
        }
      }

      // Delete vehicle entry
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', selectedVehicle.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Fahrzeug wurde erfolgreich gelöscht.",
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      refetch();
    } catch (error) {
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
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat('de-DE').format(km) + ' km';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Fahrzeugverwaltung</h1>
          <p className="text-muted-foreground mt-2 text-base">Verwalten Sie alle Fahrzeugpositionen</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="shadow-sm hover:shadow-md transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Fahrzeug hinzufügen
          </Button>
          <Button variant="outline" onClick={() => setIsBulkImageUploadDialogOpen(true)} className="hover:bg-muted/50">
            <FileUp className="mr-2 h-4 w-4" />
            Bilder Massen-Upload
          </Button>
        </div>
      </div>

      <Card className="modern-card">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <CardTitle className="text-lg font-semibold">Alle Fahrzeuge</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="modern-table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="rounded-tl-lg">Bild</TableHead>
                    <TableHead>Marke</TableHead>
                    <TableHead>Modell</TableHead>
                    <TableHead>Fahrgestell-Nr.</TableHead>
                    <TableHead>Bericht-Nr.</TableHead>
                    <TableHead>Erstzulassung</TableHead>
                    <TableHead>Kilometerstand</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead className="text-right rounded-tr-lg">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        {(() => {
                          let thumbnail = null;
                          if (vehicle.vehicle_photos && Array.isArray(vehicle.vehicle_photos) && vehicle.vehicle_photos.length > 0) {
                            thumbnail = vehicle.vehicle_photos[0];
                          }
                          
                          return thumbnail ? (
                            <img 
                              src={thumbnail} 
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="h-14 w-20 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="h-14 w-20 bg-muted/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground border border-border/40">
                              Kein Bild
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{vehicle.brand}</TableCell>
                      <TableCell className="text-muted-foreground">{vehicle.model}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{vehicle.chassis}</TableCell>
                      <TableCell className="font-medium">{vehicle.report_nr}</TableCell>
                      <TableCell className="text-muted-foreground">{vehicle.first_registration}</TableCell>
                      <TableCell className="text-muted-foreground">{formatKilometers(vehicle.kilometers)}</TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(vehicle.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10 hover:text-destructive transition-all"
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
            </div>
          ) : (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4">
                <Car className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">Keine Fahrzeuge vorhanden</p>
              <p className="text-sm">Fügen Sie Ihr erstes Fahrzeug hinzu, um loszulegen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
          </DialogHeader>
          <VehicleForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <VehicleForm 
              vehicle={selectedVehicle} 
              onSubmit={handleEdit} 
              isSubmitting={isSubmitting} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteVehicleDialog
        vehicle={selectedVehicle}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isSubmitting}
      />

      {/* Bulk Image Upload Dialog */}
      <Dialog open={isBulkImageUploadDialogOpen} onOpenChange={setIsBulkImageUploadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Bilder Massen-Upload</DialogTitle>
          </DialogHeader>
          <BulkImageUpload 
            onComplete={() => {
              refetch();
              setIsBulkImageUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
