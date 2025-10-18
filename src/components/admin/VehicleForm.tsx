import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@/lib/validation/vehicleSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Vehicle } from "@/hooks/useVehicles";
import { ImageDropZone } from "./ImageDropZone";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: VehicleFormData, vehiclePhotos?: File[], detailPhotos?: File[]) => void;
  isSubmitting: boolean;
}

export function VehicleForm({ vehicle, onSubmit, isSubmitting }: VehicleFormProps) {
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([]);
  const [vehiclePhotoPreviews, setVehiclePhotoPreviews] = useState<string[]>([]);
  const [detailPhotos, setDetailPhotos] = useState<File[]>([]);
  const [detailPhotoPreviews, setDetailPhotoPreviews] = useState<string[]>([]);

  // Load existing photos when editing
  useEffect(() => {
    if (vehicle) {
      // Load vehicle photos
      if (vehicle.vehicle_photos) {
        try {
          const photos = JSON.parse(vehicle.vehicle_photos);
          if (Array.isArray(photos)) {
            setVehiclePhotoPreviews(photos);
          }
        } catch (e) {
          console.error('Error parsing vehicle_photos', e);
        }
      }
      
      // Load detail photos
      if (vehicle.detail_photos) {
        try {
          const photos = JSON.parse(vehicle.detail_photos);
          if (Array.isArray(photos)) {
            setDetailPhotoPreviews(photos);
          }
        } catch (e) {
          console.error('Error parsing detail_photos', e);
        }
      }
    }
  }, [vehicle]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ? {
      brand: vehicle.brand,
      model: vehicle.model,
      chassis: vehicle.chassis,
      report_nr: vehicle.report_nr,
      first_registration: vehicle.first_registration,
      kilometers: vehicle.kilometers,
      price: vehicle.price,
    } : {
      brand: '',
      model: '',
      chassis: '',
      report_nr: '',
      first_registration: '',
      kilometers: 0,
      price: 0,
    },
  });

  const handleVehiclePhotosChange = (files: File[]) => {
    setVehiclePhotos(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehiclePhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDetailPhotosChange = (files: File[]) => {
    setDetailPhotos(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetailPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVehiclePhoto = (index: number) => {
    setVehiclePhotos(prev => prev.filter((_, i) => i !== index));
    setVehiclePhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeDetailPhoto = (index: number) => {
    setDetailPhotos(prev => prev.filter((_, i) => i !== index));
    setDetailPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit((data) => 
          onSubmit(data, vehiclePhotos.length > 0 ? vehiclePhotos : undefined, detailPhotos.length > 0 ? detailPhotos : undefined)
        )}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marke</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. BMW" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modell</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 320d" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chassis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fahrgestellnummer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. WBA12345678901234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="report_nr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Berichtsnummer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Erstzulassung</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 01/2020" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kilometers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometerstand</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="z.B. 50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preis (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="z.B. 25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Vehicle Photos Upload */}
        <div className="space-y-2">
          <Label>Fahrzeugbilder</Label>
              <ImageDropZone
                images={vehiclePhotoPreviews}
                onImagesChange={handleVehiclePhotosChange}
                onRemove={removeVehiclePhoto}
                label="Fahrzeugbilder"
              />
        </div>

        {/* Detail Photos Upload */}
        <div className="space-y-2">
          <Label>Detailfotos</Label>
          <ImageDropZone
            images={detailPhotoPreviews}
            onImagesChange={handleDetailPhotosChange}
            onRemove={removeDetailPhoto}
            label="Detailfotos"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : vehicle ? "Aktualisieren" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
