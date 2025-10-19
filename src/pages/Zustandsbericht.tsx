import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, Check } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import kbsLogo from "@/assets/kbs_blue.png";

const formatKilometers = (km: number) => {
  return km.toLocaleString('de-DE') + ' km';
};

export default function Zustandsbericht() {
  const { reportNr } = useParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', reportNr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('report_nr', reportNr)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
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
            Kein Fahrzeug mit Bericht-Nr. {reportNr} gefunden.
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

  // Helper: Parse bereifung data
  interface TireRow {
    position: string;
    bezeichnung: string;
    art: string;
    profiltiefe: string;
  }
  const parseBereifung = (jsonData: any): TireRow[] => {
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
      console.error('Error parsing bereifung', e);
      return [];
    }
  };

  // Parse vehicle photos and detail photos from database
  const vehiclePhotos = parseJsonArray(vehicle.vehicle_photos);
  const damagePhotos = parseJsonArray(vehicle.detail_photos);
  
  // Parse Zustandsbericht data
  const serienausstattung = parseJsonArray(vehicle.serienausstattung);
  const sonderausstattung = parseJsonArray(vehicle.sonderausstattung);
  const opticalDamages = parseJsonArray(vehicle.optische_schaeden);
  const interiorCondition = parseJsonArray(vehicle.innenraum_zustand);
  const tireData = parseBereifung(vehicle.bereifung);

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
            <p className="font-semibold">KBS Rechtsanwälte Küpper</p>
            <p className="font-semibold">Bredehöft Schwencker PartG</p>
            <p>Speldorfer Str. 2</p>
            <p>40239 Düsseldorf</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-start px-8">
            <h1 className="text-2xl font-bold mb-1 text-center">Gebrauchtwagenbericht</h1>
            <p className="text-lg text-muted-foreground text-center">Bericht-Nr. {vehicle.report_nr}</p>
          </div>
          
          <div className="h-[4.5rem] w-auto">
            <img src={kbsLogo} alt="KBS Logo" className="h-full w-auto object-contain" />
          </div>
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Preisschild-Nr.</span>
              <span>{vehicle.report_nr}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Hersteller</span>
              <span>{vehicle.brand}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Aufbau</span>
              <span>{vehicle.aufbau || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">FIN</span>
              <span>{vehicle.chassis}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Kraftstoffart / Energiequelle</span>
              <span>{vehicle.kraftstoffart || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Motorart / Zylinder</span>
              <span>{vehicle.motorart || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Leistung</span>
              <span>{vehicle.leistung || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Getriebeart</span>
              <span>{vehicle.getriebeart || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Farbe</span>
              <span>{vehicle.farbe || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Typ / Modell</span>
              <span>{vehicle.model}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Erstzulassung</span>
              <span>{vehicle.first_registration}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Abgelesener Tachostand</span>
              <span>{formatKilometers(vehicle.kilometers)}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Zul. Gesamtgewicht</span>
              <span>{vehicle.gesamtgewicht || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Hubraum</span>
              <span>{vehicle.hubraum || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Anzahl Türen</span>
              <span>{vehicle.anzahl_tueren || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Anzahl Sitzplätze</span>
              <span>{vehicle.anzahl_sitzplaetze || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Fälligkeit HU</span>
              <span>{vehicle.faelligkeit_hu || '-'}</span>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-x-4">
              <span className="font-semibold">Polster Typ / Farbe</span>
              <span>{vehicle.polster_typ || '-'}</span>
            </div>
          </div>

          {vehicle.bemerkungen && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2">Bemerkungen</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {vehicle.bemerkungen}
              </p>
            </div>
          )}
        </section>

        {/* Tire Table */}
        {tireData.length > 0 && (
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4">Bereifung</h2>
            <table className="w-full text-sm border-collapse border border-border">
              <thead>
                <tr>
                  <th className="border border-border p-2 text-left">Position</th>
                  <th className="border border-border p-2 text-left">Reifenbezeichnung</th>
                  <th className="border border-border p-2 text-left">Reifenart</th>
                  <th className="border border-border p-2 text-left">Profiltiefe</th>
                </tr>
              </thead>
              <tbody>
                {tireData.map((tire, index) => (
                  <tr key={index}>
                    <td className="border border-border p-2">{tire.position}</td>
                    <td className="border border-border p-2">{tire.bezeichnung}</td>
                    <td className="border border-border p-2">{tire.art}</td>
                    <td className="border border-border p-2">{tire.profiltiefe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">Legende: W=Winter / S=Schadhaft</p>
          </section>
        )}

        {/* Maintenance */}
        {(vehicle.wartung_datum || vehicle.wartung_kilometerstand) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Wartung</h2>
            <p className="text-sm">
              am {vehicle.wartung_datum || '-'} bei {vehicle.wartung_kilometerstand || '-'}
            </p>
          </section>
        )}

        {/* Equipment Lists */}
        {(serienausstattung.length > 0 || sonderausstattung.length > 0) && (
          <section className="mb-8 avoid-break">
            <h2 className="text-xl font-semibold mb-4">Ausstattung</h2>
            <div className="grid grid-cols-2 gap-6">
              {serienausstattung.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b border-border pb-1">Serienausstattung</h3>
                  <ul className="space-y-1 text-xs">
                    {serienausstattung.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {sonderausstattung.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b border-border pb-1">Sonderausstattung</h3>
                  <ul className="space-y-1 text-xs">
                    {sonderausstattung.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Optical Condition & Interior */}
        {(opticalDamages.length > 0 || interiorCondition.length > 0) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Optischer Zustand</h2>
            
            {opticalDamages.length > 0 && (
              <ul className="space-y-1 text-sm mb-4">
                {opticalDamages.map((damage, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{damage}</span>
                  </li>
                ))}
              </ul>
            )}

            {interiorCondition.length > 0 && (
              <>
                <h3 className="font-semibold text-sm mb-2">Innenraum</h3>
                <ul className="space-y-1 text-sm">
                  {interiorCondition.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}


        {/* Damage Photos Gallery - Conditional rendering */}
        {damagePhotos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Detailfotos der Beschädigungen</h2>
            <div className="grid grid-cols-2 gap-4">
              {damagePhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="border border-border rounded overflow-hidden aspect-[4/3] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(damagePhotos, index)}
                >
                  <img src={photo} alt={`Schaden Detail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
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

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          .avoid-break {
            page-break-inside: avoid;
          }
          
          .zustandsbericht-container {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            width: 210mm !important;
            max-width: 210mm !important;
          }
          
          * {
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        
        @media screen {
          .zustandsbericht-container {
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </>
  );
}
