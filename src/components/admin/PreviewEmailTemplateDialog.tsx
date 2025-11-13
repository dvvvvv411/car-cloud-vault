import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmailTemplate } from "@/hooks/useEmailTemplates";
import { Branding } from "@/hooks/useBranding";

interface PreviewEmailTemplateDialogProps {
  template: EmailTemplate;
  branding: Branding;
  children: React.ReactNode;
}

export const PreviewEmailTemplateDialog = ({ 
  template, 
  branding, 
  children 
}: PreviewEmailTemplateDialogProps) => {
  const [nachname, setNachname] = useState("Mustermann");

  const replaceVariables = (text: string) => {
    return text
      .replace(/%AKTENZEICHEN%/g, branding.case_number || '[Aktenzeichen]')
      .replace(/%NACHNAME%/g, nachname || '[Nachname]')
      .replace(/%ANWALT_NAME%/g, branding.lawyer_name || '[Anwaltsname]');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email-Vorschau</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vorschau-Einstellungen */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium">Vorschau-Einstellungen</p>
            <div className="space-y-2">
              <Label htmlFor="preview-nachname" className="text-xs">
                Nachname für Vorschau
              </Label>
              <Input
                id="preview-nachname"
                value={nachname}
                onChange={(e) => setNachname(e.target.value)}
                placeholder="Mustermann"
                className="h-8"
              />
            </div>
          </div>

          <Separator />

          {/* Email-Vorschau */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Betreff:</Label>
              <div className="mt-1 font-medium">
                {replaceVariables(template.subject)}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Email-Inhalt:</Label>
              <div className="bg-white border rounded-lg p-6 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {replaceVariables(template.body)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
