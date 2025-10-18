import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Printer, Check } from "lucide-react";
import kbsLogo from "@/assets/kbs_blue.png";
import vehiclePhoto1 from "@/assets/zustandsbericht/vehicle-photo-1.jpg";
import vehiclePhoto2 from "@/assets/zustandsbericht/vehicle-photo-2.jpg";
import vehiclePhoto3 from "@/assets/zustandsbericht/vehicle-photo-3.jpg";
import vehiclePhoto4 from "@/assets/zustandsbericht/vehicle-photo-4.jpg";
import vehiclePhoto5 from "@/assets/zustandsbericht/vehicle-photo-5.jpg";
import damagePhoto1 from "@/assets/zustandsbericht/damage-photo-1.jpg";
import damagePhoto2 from "@/assets/zustandsbericht/damage-photo-2.jpg";
import damagePhoto3 from "@/assets/zustandsbericht/damage-photo-3.jpg";
import damagePhoto4 from "@/assets/zustandsbericht/damage-photo-4.jpg";
import {
  serienausstattung,
  sonderausstattung,
  tireData,
  tireAssessment,
  opticalDamages,
  interiorCondition,
  standardBemerkungen,
  vehicleStaticData,
  wartungData
} from "@/data/zustandsberichtMockData";

const formatKilometers = (km: number) => {
  return km.toLocaleString('de-DE') + ' km';
};

export default function Zustandsbericht() {
  const { vehicleId } = useParams();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();
      
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
        <div className="text-lg">Fahrzeug nicht gefunden</div>
      </div>
    );
  }

  const vehiclePhotos = [vehiclePhoto1, vehiclePhoto2, vehiclePhoto3, vehiclePhoto4, vehiclePhoto5];
  const damagePhotos = [damagePhoto1, damagePhoto2, damagePhoto3, damagePhoto4];

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50">
        <Button onClick={() => window.print()} size="lg">
          <Printer className="h-5 w-5 mr-2" />
          Als PDF drucken
        </Button>
      </div>

      {/* A4 Container */}
      <div className="zustandsbericht-container w-[210mm] min-h-[297mm] mx-auto bg-white p-8 shadow-lg my-8">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-8 pb-6 border-b-2 border-border">
          <div className="text-sm">
            <p className="font-semibold">KBS Rechtsanwälte Küpper Bredehöft Schwencker PartG</p>
            <p>Speldorfer Str. 2</p>
            <p>40239 Düsseldorf</p>
          </div>
          
          <div className="text-center flex-1 px-8">
            <h1 className="text-3xl font-bold mb-2">Gebrauchtwagenbericht</h1>
            <p className="text-xl text-muted-foreground">Bericht-Nr. {vehicle.report_nr}</p>
          </div>
          
          <div className="w-32">
            <img src={kbsLogo} alt="KBS Logo" className="w-full h-auto" />
          </div>
        </header>

        {/* Vehicle Photo Gallery - 5 columns */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Fahrzeugfotos</h2>
          <div className="grid grid-cols-5 gap-2">
            {vehiclePhotos.map((photo, index) => (
              <div key={index} className="border border-border rounded overflow-hidden aspect-video">
                <img src={photo} alt={`Fahrzeug Ansicht ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Vehicle Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Fahrzeugbeschreibung</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex">
              <span className="font-semibold w-48">Preisschild-Nr.</span>
              <span>{vehicle.report_nr}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Hersteller</span>
              <span>{vehicle.brand}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Aufbau</span>
              <span>{vehicleStaticData.aufbau}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">FIN</span>
              <span>{vehicle.chassis}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Kraftstoffart / Energiequelle</span>
              <span>{vehicleStaticData.kraftstoffart}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Motorart / Zylinder</span>
              <span>{vehicleStaticData.motorart}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Leistung</span>
              <span>{vehicleStaticData.leistung}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Getriebeart</span>
              <span>{vehicleStaticData.getriebeart}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Farbe</span>
              <span>{vehicleStaticData.farbe}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Typ / Modell</span>
              <span>{vehicle.model}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Erstzulassung</span>
              <span>{vehicle.first_registration}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Abgelesener Tachostand</span>
              <span>{formatKilometers(vehicle.kilometers)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Zul. Gesamtgewicht</span>
              <span>{vehicleStaticData.gesamtgewicht}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Hubraum</span>
              <span>{vehicleStaticData.hubraum}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Anzahl Türen</span>
              <span>{vehicleStaticData.anzahlTueren}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Anzahl Sitzplätze</span>
              <span>{vehicleStaticData.anzahlSitzplaetze}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Fälligkeit HU</span>
              <span>{vehicleStaticData.faelligkeitHU}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-48">Polster Typ / Farbe</span>
              <span>{vehicleStaticData.polsterTyp}</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">Bemerkungen</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {standardBemerkungen}
            </p>
          </div>
        </section>

        {/* Tire Table */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-semibold mb-4">Bereifung</h2>
          <table className="w-full text-sm border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left">Position</th>
                <th className="border border-border p-2 text-left">Reifenbezeichnung</th>
                <th className="border border-border p-2 text-left">Reifenart</th>
                <th className="border border-border p-2 text-left">Profiltiefe</th>
              </tr>
            </thead>
            <tbody>
              {tireData.map((tire, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
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

        {/* Maintenance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Wartung</h2>
          <p className="text-sm">am {wartungData.datum} bei {wartungData.kilometerstand}</p>
        </section>

        {/* Equipment Lists */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-semibold mb-4">Ausstattung</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-sm mb-3 bg-muted p-2 rounded">Serienausstattung</h3>
              <ul className="space-y-1 text-xs">
                {serienausstattung.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3 bg-muted p-2 rounded">Sonderausstattung</h3>
              <ul className="space-y-1 text-xs">
                {sonderausstattung.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-3 w-3 mr-2 mt-0.5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Optical Condition & Interior */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Optischer Zustand</h2>
          <ul className="space-y-1 text-sm mb-4">
            {opticalDamages.map((damage, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{damage}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-sm mb-2">Innenraum</h3>
          <ul className="space-y-1 text-sm">
            {interiorCondition.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Tire Assessment Table */}
        <section className="mb-8 avoid-break">
          <h2 className="text-xl font-semibold mb-4">Reifenbewertung</h2>
          <table className="w-full text-sm border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left">Position</th>
                <th className="border border-border p-2 text-left">Reifenart</th>
                <th className="border border-border p-2 text-left">Profiltiefe</th>
                <th className="border border-border p-2 text-left">Kommentar</th>
              </tr>
            </thead>
            <tbody>
              {tireAssessment.map((tire, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                  <td className="border border-border p-2">{tire.position}</td>
                  <td className="border border-border p-2">{tire.art}</td>
                  <td className="border border-border p-2">{tire.profiltiefe}</td>
                  <td className="border border-border p-2 text-destructive font-medium">{tire.kommentar}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">Legende: W=Winter / S=Schadhaft</p>
        </section>

        {/* Damage Photos Gallery - 2 columns */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Detailfotos der Beschädigungen</h2>
          <div className="grid grid-cols-2 gap-4">
            {damagePhotos.map((photo, index) => (
              <div key={index} className="border border-border rounded overflow-hidden aspect-[4/3]">
                <img src={photo} alt={`Schaden Detail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

      </div>

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
            box-shadow: none;
            margin: 0;
            padding: 0;
            width: 100%;
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
