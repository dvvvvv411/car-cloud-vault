import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { fahrzeugeVehicleSchema, type FahrzeugeVehicleFormData } from "@/lib/validation/fahrzeugeVehicleSchema";
import { FahrzeugeVehicle } from "@/hooks/useFahrzeugeVehicles";
import { useFahrzeugeBrandings } from "@/hooks/useFahrzeugeBrandings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageDropZone } from "./ImageDropZone";

interface FahrzeugeVehicleFormProps {
  vehicle?: FahrzeugeVehicle;
  onSubmit: (data: FahrzeugeVehicleFormData, vehiclePhotos?: File[]) => void;
  onCancel: () => void;
}

const jsonArrayToText = (jsonData: string[] | null): string => {
  if (!jsonData || !Array.isArray(jsonData)) return '';
  return jsonData.join('\n');
};

export const FahrzeugeVehicleForm = ({ vehicle, onSubmit, onCancel }: FahrzeugeVehicleFormProps) => {
  const { data: brandings = [] } = useFahrzeugeBrandings();
  const [vehiclePhotos, setVehiclePhotos] = React.useState<File[]>([]);
  const [existingVehiclePhotos, setExistingVehiclePhotos] = React.useState<string[]>(vehicle?.vehicle_photos || []);

  const form = useForm<FahrzeugeVehicleFormData>({
    resolver: zodResolver(fahrzeugeVehicleSchema),
    defaultValues: {
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      fin: vehicle?.fin || "",
      laufleistung: vehicle?.laufleistung || 0,
      erstzulassung: vehicle?.erstzulassung || "",
      preis: vehicle?.preis || 0,
      leistung_kw: vehicle?.leistung_kw || undefined,
      leistung_ps: vehicle?.leistung_ps || undefined,
      motor_antrieb: vehicle?.motor_antrieb || "",
      farbe: vehicle?.farbe || "",
      innenausstattung: vehicle?.innenausstattung || "",
      tueren: vehicle?.tueren || undefined,
      sitze: vehicle?.sitze || undefined,
      hubraum: vehicle?.hubraum || "",
      garantie: vehicle?.garantie || "",
      highlights: jsonArrayToText(vehicle?.highlights),
      assistenzsysteme: jsonArrayToText(vehicle?.assistenzsysteme),
      multimedia: jsonArrayToText(vehicle?.multimedia),
      technik_sicherheit: jsonArrayToText(vehicle?.technik_sicherheit),
      interieur: jsonArrayToText(vehicle?.interieur),
      exterieur: jsonArrayToText(vehicle?.exterieur),
      sonstiges: jsonArrayToText(vehicle?.sonstiges),
      branding_ids: vehicle?.branding_ids || [],
    },
  });

  const handleSubmit = (data: FahrzeugeVehicleFormData) => {
    onSubmit(data, vehiclePhotos.length > 0 ? vehiclePhotos : undefined);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marke *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. Audi" />
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
                <FormLabel>Modell *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. Q5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FIN (Fahrzeug-Identifikationsnummer) *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="z.B. WAUZZZF36R1131408" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leistung_kw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leistung (KW)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="z.B. 150" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="leistung_ps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leistung (PS)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="z.B. 204" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="laufleistung"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laufleistung (km) *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="z.B. 10500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="erstzulassung"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Erstzulassung *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. 25.09.2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="motor_antrieb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motor/Antrieb</FormLabel>
              <FormControl>
                <Input {...field} placeholder="z.B. Diesel, Automatik/Allradantrieb" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="farbe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farbe</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. Mythosschwarz Metallic" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="innenausstattung"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Innenausstattung</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. Leder Valcona" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="tueren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Türen</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="z.B. 5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sitze"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitze</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="z.B. 5" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hubraum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hubraum</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="z.B. 1968 cm³" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preis (inkl. MwSt.) *</FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="z.B. 46990" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branding_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brandings *</FormLabel>
              <FormDescription>
                Wählen Sie die Brandings aus, unter denen dieses Fahrzeug angezeigt werden soll.
              </FormDescription>
              <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                {brandings.map(branding => (
                  <div key={branding.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value?.includes(branding.id)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        field.onChange(
                          checked 
                            ? [...current, branding.id]
                            : current.filter(id => id !== branding.id)
                        );
                      }}
                    />
                    <Label className="font-normal cursor-pointer flex-1">
                      {branding.company_name} ({branding.lawyer_name})
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Fahrzeugbilder</Label>
          <ImageDropZone
            images={existingVehiclePhotos}
            onImagesChange={(files) => setVehiclePhotos([...vehiclePhotos, ...files])}
            onRemove={(index) => {
              const newPhotos = [...existingVehiclePhotos];
              newPhotos.splice(index, 1);
              setExistingVehiclePhotos(newPhotos);
            }}
            label="Fahrzeugbilder hochladen"
          />
          {vehiclePhotos.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {vehiclePhotos.length} neue Datei(en) werden hochgeladen
            </p>
          )}
        </div>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="ausstattung">
            <AccordionTrigger>Ausstattung</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <FormField
                control={form.control}
                name="garantie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garantie</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="z.B. Anschlussgarantie 3 Jahre max. 100.000 km" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="highlights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highlights</FormLabel>
                    <FormDescription>Ein Highlight pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Bang & Olufsen Premium Sound System..." rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistenzsysteme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistenzsysteme</FormLabel>
                    <FormDescription>Ein Assistenzsystem pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Multifunktionskamera..." rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="multimedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multimedia</FormLabel>
                    <FormDescription>Ein Multimedia-Feature pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Audi phone box..." rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technik_sicherheit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technik & Sicherheit</FormLabel>
                    <FormDescription>Ein Feature pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Kindersitzbefestigung ISOFIX..." rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interieur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interieur</FormLabel>
                    <FormDescription>Ein Interieur-Feature pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Sitzheizung vorn..." rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exterieur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exterieur</FormLabel>
                    <FormDescription>Ein Exterieur-Feature pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Akustikverglasung..." rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sonstiges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sonstiges</FormLabel>
                    <FormDescription>Ein Feature pro Zeile</FormDescription>
                    <FormControl>
                      <Textarea {...field} placeholder="Innenfarbe schwarz..." rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit">
            {vehicle ? "Aktualisieren" : "Erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

import React from "react";
