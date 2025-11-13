import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, Eye, Code } from "lucide-react";

interface AdminEmailSignatureDialogProps {
  signature: string;
  onSave: (signature: string) => void;
}

export const AdminEmailSignatureDialog = ({ 
  signature, 
  onSave 
}: AdminEmailSignatureDialogProps) => {
  const [open, setOpen] = useState(false);
  const [htmlCode, setHtmlCode] = useState(signature || '');

  const handleSave = () => {
    onSave(htmlCode);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <FileSignature className="h-4 w-4 mr-2" />
          {signature ? 'Signatur bearbeiten' : 'Signatur hinzufügen'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verwaltungs E-Mail Signatur</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              HTML Code
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Fügen Sie den HTML-Code für Ihre E-Mail-Signatur ein
            </p>
            <Textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="<div>Ihr HTML-Code hier...</div>"
              className="min-h-[300px] font-mono text-sm"
            />
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Vorschau der E-Mail-Signatur
            </p>
            <div 
              className="border rounded-md p-4 min-h-[300px] bg-white"
              dangerouslySetInnerHTML={{ __html: htmlCode }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Abbrechen
          </Button>
          <Button 
            type="button"
            onClick={handleSave}
          >
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
