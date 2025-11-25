import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuickAddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataParsed: (data: any) => void;
}

export const QuickAddVehicleDialog = ({ 
  open, 
  onOpenChange, 
  onDataParsed 
}: QuickAddVehicleDialogProps) => {
  const [inputText, setInputText] = useState("");
  
  const parseVehicleData = () => {
    try {
      const lines = inputText.split('\n');
      const data: any = {};
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes(':')) return;
        
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        
        switch (key.trim().toLowerCase()) {
          case 'marke':
            data.brand = value;
            break;
          case 'modell':
            data.model = value;
            break;
          case 'leistung (kw/ps)':
          case 'leistung':
            const [kw, ps] = value.split('/').map(s => parseInt(s.trim()));
            if (!isNaN(kw)) data.leistung_kw = kw;
            if (!isNaN(ps)) data.leistung_ps = ps;
            break;
          case 'laufleistung':
            data.laufleistung = parseInt(value.replace(/[^\d]/g, ''));
            break;
          case 'erstzulassung':
            data.erstzulassung = value;
            break;
          case 'motor/antrieb':
          case 'motor':
            data.motor_antrieb = value;
            break;
          case 'farbe':
            data.farbe = value;
            break;
          case 'innenausstattung':
            data.innenausstattung = value;
            break;
          case 'türen/sitze':
          case 'türen':
            const [tueren, sitze] = value.split('/').map(s => parseInt(s.trim()));
            if (!isNaN(tueren)) data.tueren = tueren;
            if (!isNaN(sitze)) data.sitze = sitze;
            break;
          case 'hubraum':
            data.hubraum = value;
            break;
          case 'fin':
            data.fin = value;
            break;
          case 'preis':
            data.preis = parseFloat(value.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
            break;
        }
      });
      
      // Validierung
      if (!data.brand || !data.model || !data.fin) {
        toast({
          title: "Fehler",
          description: "Mindestens Marke, Modell und FIN müssen angegeben werden.",
          variant: "destructive",
        });
        return;
      }
      
      onDataParsed(data);
      setInputText("");
      onOpenChange(false);
      
      toast({
        title: "Erfolg",
        description: "Fahrzeugdaten wurden erfolgreich importiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Daten konnten nicht geparst werden. Bitte überprüfen Sie das Format.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Add - Fahrzeugdaten einfügen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Fügen Sie die Fahrzeugdaten im folgenden Format ein:
            </p>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`Marke: Audi
Modell: A6 Avant S Line 2.0 TDI
Leistung (KW/PS): 150/204
Laufleistung: 10.500km
Erstzulassung: 25.09.2024
Motor/Antrieb: Diesel, Automatik/Allradantrieb
Farbe: Mythosschwarz Metallic
Innenausstattung: Leder Valcona
Türen/Sitze: 5/5
Hubraum: 1968 cm³
FIN: WAUZZZF36R1131408
Preis: 50.000€`}
            </pre>
          </div>
          
          <Textarea
            placeholder="Fahrzeugdaten hier einfügen..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={parseVehicleData}>
              Daten importieren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
