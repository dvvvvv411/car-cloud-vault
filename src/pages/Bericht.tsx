import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, Check } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useDomainBranding } from "@/hooks/useDomainBranding";

const formatKilometers = (km: number) => {
  return km.toLocaleString('de-DE') + ' km';
};

const formatPrice = (price: number) => {
  return price.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + '.-€';
};

interface AusstattungSection {
  id: string;
  title: string;
  content: string;
}

export default function Bericht() {
  const { id } = useParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['fahrzeuge-vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fahrzeuge_vehicles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const { branding, isLoading: brandingLoading } = useDomainBranding();

  if (isLoading || brandingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Fahrzeug nicht gefunden</h1>
          <p className="text-muted-foreground">
            Kein Fahrzeug mit dieser ID gefunden.
          </p>
        </div>
      </div>
    );
  }

  // Helper: Parse JSON array from DB
  const parseJsonArray = (jsonData: any): string[] => {
    if (!jsonData) return [];
    try {
      // If it's already an array, return it
      if (Array.isArray(jsonData)) return jsonData;
      // If it's a string, parse it
      if (typeof jsonData === 'string') {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error('Error parsing JSON array', e);
      return [];
    }
  };

  // Helper: Parse ausstattung sections
  const parseAusstattungSections = (jsonData: any): AusstattungSection[] => {
    if (!jsonData) return [];
    try {
      if (Array.isArray(jsonData)) return jsonData;
      if (typeof jsonData === 'string') {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error('Error parsing ausstattung sections', e);
      return [];
    }
  };

  // Parse vehicle photos from database
  const vehiclePhotos = parseJsonArray(vehicle.vehicle_photos);
  
  // Parse ausstattung sections
  const ausstattungSections = parseAusstattungSections(vehicle.ausstattung_sections);

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50">
        <Button 
          onClick={() => window.print()} 
          size="lg"
          title="Tipp: Deaktivieren Sie 'Kopf- und Fußzeilen' im Druckdialog für ein sauberes PDF"
        >
          <Printer className="h-5 w-5 mr-2" />
          Als PDF drucken
        </Button>
      </div>

      {/* A4 Container */}
      <div className="zustandsbericht-container w-[210mm] min-h-[297mm] mx-auto bg-white p-8 shadow-lg my-8">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-8 pb-6 border-b-2 border-border">
          <div className="text-sm leading-tight">
            <p className="font-semibold">
              {branding?.lawyer_firm_name || 'Fahrzeugverkauf'}
            </p>
            {branding?.lawyer_firm_subtitle && (
              <p className="font-semibold">{branding.lawyer_firm_subtitle}</p>
            )}
            <p>{branding?.lawyer_address_street || ''}</p>
            <p>{branding?.lawyer_address_city || ''}</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-start px-8">
            <h1 className="text-2xl font-bold mb-1 text-center">Fahrzeugbericht</h1>
            <p className="text-lg text-muted-foreground text-center">{vehicle.brand} {vehicle.model}</p>
          </div>
          
          {branding?.kanzlei_logo_url && (
            <div className="h-[4.5rem] w-auto">
              <img 
                src={branding.kanzlei_logo_url} 
                alt={`${branding.lawyer_firm_name} Logo`} 
                className="h-full w-auto object-contain" 
              />
            </div>
          )}
        </header>

        {/* Vehicle Photo Gallery - Conditional rendering */}
        {vehiclePhotos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Fahrzeugfotos</h2>
            <div className="grid grid-cols-5 gap-2">
              {vehiclePhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="border border-border rounded overflow-hidden aspect-video cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(vehiclePhotos, index)}
                >
                  <img src={photo} alt={`Fahrzeug Ansicht ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vehicle Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Fahrzeugbeschreibung</h2>
          <div className="flex gap-8">
          {/* Linke Spalte - Fahrzeugdaten */}
          <div className="flex-1 space-y-1 text-sm">
              <div className="flex">
                <span className="font-semibold w-[180px]">Leistung (KW/PS):</span>
                <span>
                  {vehicle.leistung_kw && vehicle.leistung_ps 
                    ? `${vehicle.leistung_kw}/${vehicle.leistung_ps}` 
                    : '-'}
                </span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Laufleistung:</span>
                <span>{formatKilometers(vehicle.laufleistung)}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Erstzulassung:</span>
                <span>{vehicle.erstzulassung}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Motor/Antrieb:</span>
                <span>{vehicle.motor_antrieb || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Farbe:</span>
                <span>{vehicle.farbe || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Innenausstattung:</span>
                <span>{vehicle.innenausstattung || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Türen/Sitze:</span>
                <span>{vehicle.tueren || '-'}/{vehicle.sitze || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">Hubraum:</span>
                <span>{vehicle.hubraum || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-[180px]">FIN:</span>
                <span>{vehicle.fin}</span>
              </div>
            </div>
            
            {/* Rechte Spalte - Preis dominant */}
            <div className="w-[200px] flex flex-col items-end justify-center text-right">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(vehicle.preis)}
              </span>
              <span className="text-sm text-muted-foreground mt-1">
                inkl. MwSt
              </span>
            </div>
          </div>
        </section>

        {/* Equipment Sections */}
        {ausstattungSections.length > 0 && (
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4 underline">Ausstattung</h2>
            {ausstattungSections.map((section) => (
          <div key={section.id} className="mb-3">
            <h3 className="font-semibold text-base mb-1">
              {section.title}:
            </h3>
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </section>
        )}

      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
