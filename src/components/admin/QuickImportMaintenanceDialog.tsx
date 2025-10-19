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
import { toast } from "@/hooks/use-toast";

interface QuickImportMaintenanceDialogProps {
  onImport: (data: { wartung_datum: string; wartung_kilometerstand: string }) => void;
}

export function QuickImportMaintenanceDialog({ onImport }: QuickImportMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const parseMaintenanceText = (text: string) => {
    // RegEx für: "am DD.MM.YYYY bei XX.XXX km"
    const regex = /am\s+(\d{1,2}\.\d{1,2}\.\d{4})\s+bei\s+([\d.,]+)\s*km/i;
    const match = text.match(regex);
    
    if (match) {
      return {
        wartung_datum: match[1],           // "28.02.2024"
        wartung_kilometerstand: match[2].replace(/\./g, '').replace(',', '.')   // "111.185" -> "111185"
      };
    }
    
    return null;
  };

  const handleImport = () => {
    const parsed = parseMaintenanceText(inputText);
    if (parsed) {
      onImport(parsed);
      toast({
        title: "Wartungsdaten importiert",
        description: `Datum: ${parsed.wartung_datum}, KM: ${parsed.wartung_kilometerstand}`
      });
      setInputText("");
      setOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Ungültiges Format",
        description: "Bitte Format verwenden: am DD.MM.YYYY bei XX.XXX km"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Schnell-Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Wartungsdaten importieren</DialogTitle>
          <DialogDescription>
            Format: "am [Datum] bei [Kilometerstand]"
            <br />
            Beispiel: "am 28.02.2024 bei 111.185 km"
          </DialogDescription>
        </DialogHeader>
        
        <Textarea 
          placeholder="am 28.02.2024 bei 111.185 km"
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="font-mono"
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport}>
            Importieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
