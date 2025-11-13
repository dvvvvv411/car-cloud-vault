import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface PreviewEmailTemplateDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewEmailTemplateDialog({
  template,
  open,
  onOpenChange,
}: PreviewEmailTemplateDialogProps) {
  if (!template) return null;

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      'single_male': 'Herr - 1 Fahrzeug',
      'single_female': 'Frau - 1 Fahrzeug',
      'multiple_male': 'Herr - Mehrere Fahrzeuge',
      'multiple_female': 'Frau - Mehrere Fahrzeuge'
    };
    return labels[type] || type;
  };

  const previewSubject = template.subject
    .replace(/%AKTENZEICHEN%/g, '123 IN 456/78');

  const previewBody = template.body
    .replace(/%NACHNAME%/g, 'Mustermann')
    .replace(/%ANWALT_NAME%/g, 'Max Muster');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Vorschau: {getTemplateLabel(template.template_type)}
          </DialogTitle>
          <DialogDescription>
            Vorschau mit Beispiel-Daten (Mustermann, Max Muster, AZ 123 IN 456/78)
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">
                Betreff:
              </div>
              <div className="text-base font-medium">
                {previewSubject}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-semibold text-muted-foreground mb-2">
                Email-Text:
              </div>
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-md">
                {previewBody}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
