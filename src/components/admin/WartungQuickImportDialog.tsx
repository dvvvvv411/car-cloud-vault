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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WartungQuickImportDialogProps {
  onImport: (data: { wartung_datum: string; wartung_kilometerstand: string }) => void;
}

export function WartungQuickImportDialog({ onImport }: WartungQuickImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const parseWartungText = (text: string) => {
    // Regex pattern: am DD.MM.YYYY bei XXX.XXX km oder bei XXX.XXX am DD.MM.YYYY
    const pattern1 = /am\s+(\d{2}\.\d{2}\.\d{4})\s+bei\s+([\d.]+)\s*km/i;
    const pattern2 = /bei\s+([\d.]+)\s*km\s+am\s+(\d{2}\.\d{2}\.\d{4})/i;
    
    let match = text.match(pattern1);
    if (match) {
      return {
        wartung_datum: match[1],
        wartung_kilometerstand: match[2] + ' km'
      };
    }
    
    match = text.match(pattern2);
    if (match) {
      return {
        wartung_datum: match[2],
        wartung_kilometerstand: match[1] + ' km'
      };
    }
    
    return null;
  };

  const handleImport = () => {
    const parsed = parseWartungText(inputText);
    
    if (!parsed) {
      toast({
        title: "Fehler beim Parsen",
        description: "Bitte verwende das Format: am DD.MM.YYYY bei XXX.XXX km",
        variant: "destructive",
      });
      return;
    }
    
    onImport(parsed);
    setInputText("");
    setOpen(false);
    
    toast({
      title: "Wartungsdaten importiert",
      description: "Die Wartungsinformationen wurden erfolgreich eingetragen.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="ml-2"
        >
          <FileText className="h-4 w-4 mr-2" />
          Quick Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Wartungsdaten importieren</DialogTitle>
          <DialogDescription>
            Gib den Text im Format "am DD.MM.YYYY bei XXX.XXX km" ein.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wartung-text">Wartungstext</Label>
            <Input
              id="wartung-text"
              placeholder="z.B. am 28.02.2024 bei 111.185 km"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Beispiele:
              <br />• am 28.02.2024 bei 111.185 km
              <br />• bei 111185 km am 28.02.2024
            </p>
          </div>
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
