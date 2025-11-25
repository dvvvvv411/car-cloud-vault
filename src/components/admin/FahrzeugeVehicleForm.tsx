import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { fahrzeugeVehicleSchema, type FahrzeugeVehicleFormData } from "@/lib/validation/fahrzeugeVehicleSchema";
import { FahrzeugeVehicle, AusstattungSection } from "@/hooks/useFahrzeugeVehicles";
import { useFahrzeugeBrandings } from "@/hooks/useFahrzeugeBrandings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageDropZone } from "./ImageDropZone";
import { Plus, Trash2 } from "lucide-react";

interface FahrzeugeVehicleFormProps {
  vehicle?: FahrzeugeVehicle;
  onSubmit: (data: FahrzeugeVehicleFormData, vehiclePhotos?: File[]) => void;
  onCancel: () => void;
  defaultValues?: Partial<FahrzeugeVehicleFormData>;
}

export const FahrzeugeVehicleForm = ({ vehicle, onSubmit, onCancel, defaultValues }: FahrzeugeVehicleFormProps) => {
  const { data: brandings = [] } = useFahrzeugeBrandings();
  const [vehiclePhotos, setVehiclePhotos] = React.useState<File[]>([]);
  const [existingVehiclePhotos, setExistingVehiclePhotos] = React.useState<string[]>(
    Array.isArray(vehicle?.vehicle_photos) ? vehicle.vehicle_photos : []
  );
  const [ausstattungSections, setAusstattungSections] = React.useState<AusstattungSection[]>(
    Array.isArray(vehicle?.ausstattung_sections) ? vehicle.ausstattung_sections : []
  );

  const form = useForm<FahrzeugeVehicleFormData>({
    resolver: zodResolver(fahrzeugeVehicleSchema),
    defaultValues: defaultValues || {
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
      branding_ids: vehicle?.branding_ids || [],
    },
  });

  // Update form when defaultValues change (Quick Add)
  React.useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      form.reset({ ...form.getValues(), ...defaultValues });
    }
  }, [defaultValues]);

  const addSection = () => {
    setAusstattungSections([
      ...ausstattungSections,
      { id: crypto.randomUUID(), title: "", content: "" }
    ]);
  };

  const removeSection = (id: string) => {
    setAusstattungSections(sections => sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setAusstattungSections(sections =>
      sections.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const handleReorderVehiclePhotos = (fromIndex: number, toIndex: number) => {
    const newUrls = [...existingVehiclePhotos];
    const [movedUrl] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedUrl);
    setExistingVehiclePhotos(newUrls);
    
    const newFiles = [...vehiclePhotos];
    if (fromIndex < newFiles.length && toIndex < newFiles.length) {
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      setVehiclePhotos(newFiles);
    }
  };

  const handleSetFeaturedVehiclePhoto = (index: number) => {
    handleReorderVehiclePhotos(index, 0);
  };

  const handleSubmit = (data: FahrzeugeVehicleFormData) => {
    const finalData = {
      ...data,
      ausstattung_sections: ausstattungSections.filter(
        s => s.title.trim() && s.content.trim()
      ),
    };
    onSubmit(finalData, vehiclePhotos.length > 0 ? vehiclePhotos : undefined);
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
            onImagesChange={(files) => {
              setVehiclePhotos([...vehiclePhotos, ...files]);
              const newUrls = files.map(file => URL.createObjectURL(file));
              setExistingVehiclePhotos([...existingVehiclePhotos, ...newUrls]);
            }}
            onRemove={(index) => {
              const newPhotos = existingVehiclePhotos.filter((_, i) => i !== index);
              setExistingVehiclePhotos(newPhotos);
              if (index < vehiclePhotos.length) {
                const newFiles = vehiclePhotos.filter((_, i) => i !== index);
                setVehiclePhotos(newFiles);
              }
            }}
            onReorder={handleReorderVehiclePhotos}
            onSetAsFeatured={handleSetFeaturedVehiclePhoto}
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
              {ausstattungSections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Abschnitt {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="z.B. Highlights, Premium-Paket, Winter-Ausstattung"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Inhalt</Label>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Beschreibung der Ausstattung..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Der Text wird 1:1 übernommen (keine automatische Formatierung)
                    </p>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addSection}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neuen Abschnitt hinzufügen
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1">
            {vehicle ? "Fahrzeug aktualisieren" : "Fahrzeug hinzufügen"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </form>
    </Form>
  );
};
