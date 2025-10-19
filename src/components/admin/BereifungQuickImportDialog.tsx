import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BereifungData {
  vorne_links: { bezeichnung: string; art: string; profiltiefe: string };
  vorne_rechts: { bezeichnung: string; art: string; profiltiefe: string };
  hinten_links: { bezeichnung: string; art: string; profiltiefe: string };
  hinten_rechts: { bezeichnung: string; art: string; profiltiefe: string };
}

interface BereifungQuickImportDialogProps {
  onImport: (data: BereifungData) => void;
}

function parseBereifungText(text: string): BereifungData | null {
  const lines = text.split('\n').filter(l => l.trim());
  
  if (lines.length !== 4) {
    return null;
  }
  
  const parsePosition = (line: string, expectedPosition: string) => {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length !== 4) return null;
    
    const [position, bezeichnung, art, profiltiefe] = parts;
    
    // Check if position matches expected
    const posLower = position.toLowerCase();
    if (!posLower.includes(expectedPosition.toLowerCase())) {
      return null;
    }
    
    return { bezeichnung, art, profiltiefe };
  };
  
  // Parse each line in order
  const vl = parsePosition(lines[0], 'vorne links');
  const vr = parsePosition(lines[1], 'vorne rechts');
  const hl = parsePosition(lines[2], 'hinten links');
  const hr = parsePosition(lines[3], 'hinten rechts');
  
  if (!vl || !vr || !hl || !hr) return null;
  
  return {
    vorne_links: vl,
    vorne_rechts: vr,
    hinten_links: hl,
    hinten_rechts: hr
  };
}

export function BereifungQuickImportDialog({ onImport }: BereifungQuickImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const { toast } = useToast();

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Bereifungs-Daten ein.",
        variant: "destructive",
      });
      return;
    }

    const parsed = parseBereifungText(importText);
    
    if (!parsed) {
      toast({
        title: "Fehler",
        description: "Ungültiges Format. Bitte verwenden Sie das Format:\nVorne links | 235/45 R 17 94 W | S | 5 mm\nVorne rechts | 235/45 R 17 94 W | S | 5 mm\nHinten links | 235/45 R 17 94 W | S | 6 mm\nHinten rechts | 235/45 R 17 94 W | S | 6 mm",
        variant: "destructive",
      });
      return;
    }

    onImport(parsed);
    setImportText("");
    setOpen(false);
    
    toast({
      title: "Erfolg",
      description: "Bereifungs-Daten wurden erfolgreich importiert.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Schnell-Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bereifung Schnell-Import</DialogTitle>
          <DialogDescription>
            Fügen Sie die Bereifungs-Daten im folgenden Format ein (4 Zeilen):
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm font-mono">
            <div>Vorne links | 235/45 R 17 94 W | S | 5 mm</div>
            <div>Vorne rechts | 235/45 R 17 94 W | S | 5 mm</div>
            <div>Hinten links | 235/45 R 17 94 W | S | 6 mm</div>
            <div>Hinten rechts | 235/45 R 17 94 W | S | 6 mm</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-text">Bereifungs-Daten</Label>
            <Textarea
              id="import-text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Vorne links | 235/45 R 17 94 W | S | 5 mm&#10;Vorne rechts | 235/45 R 17 94 W | S | 5 mm&#10;Hinten links | 235/45 R 17 94 W | S | 6 mm&#10;Hinten rechts | 235/45 R 17 94 W | S | 6 mm"
              className="min-h-[200px] font-mono text-sm"
            />
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
