import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AusstattungSection } from "@/hooks/useFahrzeugeVehicles";

interface AusstattungQuickImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataParsed: (sections: AusstattungSection[]) => void;
}

const parseAusstattungText = (text: string): AusstattungSection[] => {
  const lines = text.split('\n');
  const sections: AusstattungSection[] = [];
  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a title (ends with ":" and doesn't contain commas)
    if (trimmedLine.endsWith(':') && !trimmedLine.includes(',')) {
      // Save previous section if it exists
      if (currentTitle && currentContent.length > 0) {
        sections.push({
          id: crypto.randomUUID(),
          title: currentTitle.replace(/:$/, ''), // Remove ":"
          content: currentContent.join('\n').trim()
        });
      }
      // Start new section
      currentTitle = trimmedLine;
      currentContent = [];
    } else if (trimmedLine) {
      // Add content line
      currentContent.push(trimmedLine);
    }
  }
  
  // Don't forget the last section
  if (currentTitle && currentContent.length > 0) {
    sections.push({
      id: crypto.randomUUID(),
      title: currentTitle.replace(/:$/, ''),
      content: currentContent.join('\n').trim()
    });
  }
  
  return sections;
};

export const AusstattungQuickImportDialog = ({
  open,
  onOpenChange,
  onDataParsed,
}: AusstattungQuickImportDialogProps) => {
  const [inputText, setInputText] = useState("");

  const handleImport = () => {
    if (!inputText.trim()) return;
    
    const parsed = parseAusstattungText(inputText);
    
    if (parsed.length > 0) {
      onDataParsed(parsed);
      setInputText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quick Add - Ausstattung importieren</DialogTitle>
          <DialogDescription>
            Fügen Sie Ausstattungstext im Format ein: Titel endet mit ":", gefolgt von Inhalt in den nächsten Zeilen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Beispiel:

Garantie: 
Anschlussgarantie 3 Jahre max. 100.000 km

Getriebe / Antrieb: 
Automatik, Allradantrieb (quattro mit ultra-Technologie)

Pakete: 
Assistenzpaket Parken, Assistenzpaket Tour, Interieur S line`}
            className="min-h-[400px] font-mono text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={!inputText.trim()}>
            Importieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
