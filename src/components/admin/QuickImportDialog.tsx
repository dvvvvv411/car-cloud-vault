import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuickImportDialogProps {
  onImport: (data: Record<string, any>) => void;
}

export function QuickImportDialog({ onImport }: QuickImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const parseTabSeparatedData = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const data: Record<string, any> = {};
    
    const mapping: Record<string, string> = {
      'Hersteller': 'brand',
      'Aufbau': 'aufbau',
      'FIN': 'chassis',
      'Kraftstoffart / Energiequelle': 'kraftstoffart',
      'Motorart / Zylinder': 'motorart',
      'Leistung': 'leistung',
      'Getriebeart': 'getriebeart',
      'Farbe': 'farbe',
      'Typ / Modell': 'model',
      'Erstzulassung': 'first_registration',
      'Abgelesener Tachostand': 'kilometers',
      'abgelesener Tachostand': 'kilometers',
      'Zul. Gesamtgewicht': 'gesamtgewicht',
      'Hubraum': 'hubraum',
      'Anzahl Türen': 'anzahl_tueren',
      'Anzahl Sitzplätze': 'anzahl_sitzplaetze',
      'Fälligkeit HU': 'faelligkeit_hu',
      'Polster Typ / Farbe': 'polster_typ',
    };
    
    let importedCount = 0;
    
    lines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length < 2) return;
      
      const label = parts[0].trim();
      const value = parts.slice(1).join('\t').trim();
      const fieldName = mapping[label];
      
      if (fieldName && value) {
        // Spezialbehandlung für Kilometerstand (muss Zahl sein)
        if (fieldName === 'kilometers') {
          const kmMatch = value.match(/[\d.,]+/);
          if (kmMatch) {
            data[fieldName] = parseInt(kmMatch[0].replace(/\./g, '').replace(',', ''));
            importedCount++;
          }
        } else {
          data[fieldName] = value;
          importedCount++;
        }
      }
    });
    
    return { data, importedCount };
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte fügen Sie Daten ein",
        variant: "destructive",
      });
      return;
    }

    const { data, importedCount } = parseTabSeparatedData(importText);
    
    if (importedCount === 0) {
      toast({
        title: "Keine Daten importiert",
        description: "Bitte überprüfen Sie das Format (Tab-separiert)",
        variant: "destructive",
      });
      return;
    }

    onImport(data);
    setOpen(false);
    setImportText("");
    
    toast({
      title: "Import erfolgreich",
      description: `${importedCount} Felder wurden importiert`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Schnell-Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schnell-Import Fahrzeugbeschreibung</DialogTitle>
          <DialogDescription>
            Fügen Sie die Daten im Tab-separierten Format ein. Format: Feldname[TAB]Wert
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`Hersteller\tSkoda\nAufbau\tGeländewagen / SUV\nFIN\tTMBJG7NU9M5018249\nKraftstoffart / Energiequelle\tDiesel\nMotoart / Zylinder\tReihenmotor / 4\nLeistung\t85 kW (116 PS)\nGetriebeart\tAutomatik\nFarbe\tSchwarz-Magic Perleffekt\nTyp / Modell\tKaroq 1.6 TDI Ambition\nErstzulassung\t20.11.2020\nAbgelesener Tachostand\t65.252 km\nZul. Gesamtgewicht\t1.952 kg\nHubraum\t1.598 cm³\nAnzahl Türen\t5\nAnzahl Sitzplätze\t5\nFälligkeit HU\t11/2025\nPolster Typ / Farbe\tStoff / Anthrazit`}
            rows={20}
            className="font-mono text-sm"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleImport}>
            Importieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
