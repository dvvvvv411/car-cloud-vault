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
import { BulkPDFUpload } from "@/components/admin/BulkPDFUpload";
import { VehicleFormData } from "@/lib/validation/vehicleSchema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPositionen() {
  const { data: vehicles, isLoading, refetch } = useVehicles();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async (file: File, vehicleId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadPDF = async (file: File, reportNr: string) => {
    const fileName = `${reportNr}.pdf`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('vehicle-reports')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('vehicle-reports')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleCreate = async (data: VehicleFormData, imageFile?: File, pdfFile?: File) => {
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
          image_url: null,
          dekra_url: null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Upload files if provided
      let imageUrl = null;
      let pdfUrl = null;

      if (imageFile && newVehicle) {
        imageUrl = await uploadImage(imageFile, newVehicle.id);
      }

      if (pdfFile && newVehicle) {
        pdfUrl = await uploadPDF(pdfFile, data.report_nr);
      }

      // Update vehicle with file URLs
      if ((imageUrl || pdfUrl) && newVehicle) {
        const { error: updateError } = await supabase
          .from("vehicles")
          .update({
            image_url: imageUrl,
            dekra_url: pdfUrl,
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

  const handleEdit = async (data: VehicleFormData, imageFile?: File, pdfFile?: File) => {
    if (!selectedVehicle) return;
    
    setIsSubmitting(true);
    try {
      // Upload new files if provided
      let imageUrl = selectedVehicle.image_url;
      let pdfUrl = selectedVehicle.dekra_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, selectedVehicle.id);
      }

      if (pdfFile) {
        pdfUrl = await uploadPDF(pdfFile, data.report_nr);
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
          image_url: imageUrl,
          dekra_url: pdfUrl,
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
      // Delete files from storage
      if (selectedVehicle.image_url) {
        const imagePath = selectedVehicle.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('vehicle-images')
            .remove([imagePath]);
        }
      }

      if (selectedVehicle.dekra_url) {
        const pdfPath = selectedVehicle.dekra_url.split('/').pop();
        if (pdfPath) {
          await supabase.storage
            .from('vehicle-reports')
            .remove([pdfPath]);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fahrzeugverwaltung</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie alle Fahrzeugpositionen</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Fahrzeug hinzufügen
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            PDF Massen-Upload
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Fahrzeuge</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bild</TableHead>
                    <TableHead>Marke</TableHead>
                    <TableHead>Modell</TableHead>
                    <TableHead>Fahrgestell-Nr.</TableHead>
                    <TableHead>Bericht-Nr.</TableHead>
                    <TableHead>Erstzulassung</TableHead>
                    <TableHead>Kilometerstand</TableHead>
                    <TableHead>Preis</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        {vehicle.image_url ? (
                          <img 
                            src={vehicle.image_url} 
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-12 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            Kein Bild
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell className="font-mono text-sm">{vehicle.chassis}</TableCell>
                      <TableCell>{vehicle.report_nr}</TableCell>
                      <TableCell>{vehicle.first_registration}</TableCell>
                      <TableCell>{formatKilometers(vehicle.kilometers)}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(vehicle.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
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
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Keine Fahrzeuge vorhanden.</p>
              <p className="text-sm mt-1">Fügen Sie Ihr erstes Fahrzeug hinzu.</p>
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

      {/* Bulk PDF Upload Dialog */}
      <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>PDF Massen-Upload</DialogTitle>
          </DialogHeader>
          <BulkPDFUpload 
            onComplete={() => {
              refetch();
              setIsBulkUploadDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
