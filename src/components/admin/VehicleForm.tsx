import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@/lib/validation/vehicleSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  // Helper to convert JSON array to textarea lines
  const jsonArrayToText = (jsonStr: string | null | undefined): string => {
    if (!jsonStr) return '';
    try {
      const arr = JSON.parse(jsonStr);
      return Array.isArray(arr) ? arr.join('\n') : '';
    } catch (e) {
      return '';
    }
  };

  // Helper function to generate raw text from vehicle data
  const generateRawText = (vehicle: any): string => {
    if (!vehicle) return '';
    return [
      `Hersteller\t${vehicle.brand || ''}`,
      `Aufbau\t${vehicle.aufbau || ''}`,
      `FIN\t${vehicle.chassis || ''}`,
      `Kraftstoffart / Energiequelle\t${vehicle.kraftstoffart || ''}`,
      `Motorart / Zylinder\t${vehicle.motorart || ''}`,
      `Leistung\t${vehicle.leistung || ''}`,
      `Getriebeart\t${vehicle.getriebeart || ''}`,
      `Farbe\t${vehicle.farbe || ''}`,
      `Typ / Modell\t${vehicle.model || ''}`,
      `Erstzulassung\t${vehicle.first_registration || ''}`,
      `abgelesener Tachostand\t${vehicle.kilometers || ''}`,
      `Zul. Gesamtgewicht\t${vehicle.gesamtgewicht || ''}`,
      `Hubraum\t${vehicle.hubraum || ''}`,
      `Anzahl Türen\t${vehicle.anzahl_tueren || ''}`,
      `Anzahl Sitzplätze\t${vehicle.anzahl_sitzplaetze || ''}`,
      `Fälligkeit HU\t${vehicle.faelligkeit_hu || ''}`,
      `Polster Typ / Farbe\t${vehicle.polster_typ || ''}`,
    ].join('\n');
  };

  // Helper function to generate tire raw text from JSON
  const generateTireRawText = (bereifungJson: string | null | undefined): string => {
    if (!bereifungJson) return '';
    try {
      const tireRows = JSON.parse(bereifungJson);
      if (!Array.isArray(tireRows) || tireRows.length === 0) return '';
      
      return tireRows.map((row: any) => 
        `${row.position || ''}\t${row.bezeichnung || ''}\t${row.art || ''}\t${row.profiltiefe || ''}`
      ).join('\n');
    } catch (e) {
      return '';
    }
  };

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
      
      // Fahrzeugbeschreibung als Rohtext
      fahrzeugbeschreibung_raw: generateRawText(vehicle),
      
      // Wartung
      wartung_datum: vehicle.wartung_datum || '',
      wartung_kilometerstand: vehicle.wartung_kilometerstand || '',
      
      // Ausstattung
      serienausstattung: jsonArrayToText(vehicle.serienausstattung),
      sonderausstattung: jsonArrayToText(vehicle.sonderausstattung),
      
      // Optischer Zustand
      optische_schaeden: jsonArrayToText(vehicle.optische_schaeden),
      innenraum_zustand: jsonArrayToText(vehicle.innenraum_zustand),
      
      // Bereifung als Rohtext
      bereifung: generateTireRawText(vehicle.bereifung),
    } : {
      brand: '',
      model: '',
      chassis: '',
      report_nr: '',
      first_registration: '',
      kilometers: 0,
      price: 0,
      fahrzeugbeschreibung_raw: '',
      wartung_datum: '',
      wartung_kilometerstand: '',
      serienausstattung: '',
      sonderausstattung: '',
      optische_schaeden: '',
      innenraum_zustand: '',
      bereifung: '',
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

        {/* Accordion for Zustandsbericht Details */}
        <Accordion type="multiple" className="w-full">
          
          {/* Fahrzeugbeschreibung Details */}
          <AccordionItem value="details">
            <AccordionTrigger className="text-base font-semibold">
              Fahrzeugbeschreibung (Details)
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="fahrzeugbeschreibung_raw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fahrzeugbeschreibung</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={18}
                        className="font-mono text-sm"
                        placeholder="Format: Feldname[TAB]Wert (eine Zeile pro Feld)&#x0A;&#x0A;Beispiel:&#x0A;Hersteller	Volkswagen&#x0A;Aufbau	Transporter Kombi&#x0A;FIN	WV2ZZZ7HZLX009005&#x0A;Kraftstoffart / Energiequelle	Diesel&#x0A;Motorart / Zylinder	Reihenmotor / 4&#x0A;Leistung	81 kW (110 PS)&#x0A;Getriebeart	Schaltgetriebe&#x0A;Farbe	Candy-Weiß&#x0A;Typ / Modell	T6.1 2.0 TDI Kombi&#x0A;Erstzulassung	06.02.2020&#x0A;abgelesener Tachostand	84613&#x0A;Zul. Gesamtgewicht	3.080 kg&#x0A;Hubraum	1.968 cm³&#x0A;Anzahl Türen	4&#x0A;Anzahl Sitzplätze	9&#x0A;Fälligkeit HU	Fällig&#x0A;Polster Typ / Farbe	Kunstleder / Grau"
                      />
                    </FormControl>
                    <FormDescription>
                      Kopieren Sie die Tabelle mit Tab-Trennung ein. Format: Feldname[TAB]Wert (pro Zeile)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Wartung */}
          <AccordionItem value="wartung">
            <AccordionTrigger className="text-base font-semibold">
              Wartung
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wartung_datum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wartungsdatum</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 15.03.2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wartung_kilometerstand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometerstand bei Wartung</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 45.000 km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ausstattung */}
          <AccordionItem value="ausstattung">
            <AccordionTrigger className="text-base font-semibold">
              Ausstattung
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="serienausstattung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serienausstattung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eine Zeile pro Ausstattungsmerkmal, z.B.:&#10;ABS (Antiblockiersystem)&#10;ESP (Elektronisches Stabilitätsprogramm)&#10;Zentralverriegelung"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jede Zeile wird als separater Ausstattungspunkt angezeigt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sonderausstattung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sonderausstattung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eine Zeile pro Ausstattungsmerkmal, z.B.:&#10;Navigationssystem Professional&#10;Panorama-Schiebedach&#10;Ledersitze mit Memory-Funktion"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jede Zeile wird als separater Ausstattungspunkt angezeigt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Optischer Zustand */}
          <AccordionItem value="zustand">
            <AccordionTrigger className="text-base font-semibold">
              Optischer Zustand
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="optische_schaeden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Optische Schäden / Mängel</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eine Zeile pro Schaden/Mangel, z.B.:&#10;Kleine Kratzer an der Stoßstange vorne&#10;Steinschlag an der Motorhaube&#10;Leichte Gebrauchsspuren an den Türgriffen"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jede Zeile wird als separater Punkt angezeigt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="innenraum_zustand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Innenraum-Zustand</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eine Zeile pro Zustandsbeschreibung, z.B.:&#10;Sitze in gutem Zustand&#10;Armaturenbrett ohne Beschädigungen&#10;Teppiche sauber und gepflegt"
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jede Zeile wird als separater Punkt angezeigt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Bereifung */}
          <AccordionItem value="bereifung">
            <AccordionTrigger className="text-base font-semibold">
              Bereifung
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="bereifung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reifendaten (Tabelle)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eine Zeile pro Reifen im Format: Position | Bezeichnung | Art | Profiltiefe&#10;&#10;Beispiel:&#10;Vorne links | 205/65 R 16 105 T | W / S | 2 mm&#10;Vorne rechts | 205/65 R 16 105 T | W / S | 2 mm&#10;Hinten links | 205/65 R 16 105 T | W / S | 3 mm&#10;Hinten rechts | 205/65 R 16 105 T | W / S | 3 mm"
                        className="min-h-[180px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Jede Zeile wird zu einer Tabellenzeile. Format: Position | Bezeichnung | Art | Profiltiefe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : vehicle ? "Aktualisieren" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
