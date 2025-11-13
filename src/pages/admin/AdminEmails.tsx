import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Edit, Eye } from "lucide-react";
import { useBrandings } from "@/hooks/useBranding";
import { useEmailTemplates, EmailTemplateType } from "@/hooks/useEmailTemplates";
import { EditEmailTemplateDialog } from "@/components/admin/EditEmailTemplateDialog";
import { PreviewEmailTemplateDialog } from "@/components/admin/PreviewEmailTemplateDialog";

const templateLabels: Record<EmailTemplateType, { title: string; description: string }> = {
  single_male: {
    title: "Einzelnes Fahrzeug - Männlich",
    description: "Sehr geehrter Herr [Nachname], ein Fahrzeug"
  },
  single_female: {
    title: "Einzelnes Fahrzeug - Weiblich",
    description: "Sehr geehrte Frau [Nachname], ein Fahrzeug"
  },
  multiple_male: {
    title: "Mehrere Fahrzeuge - Männlich",
    description: "Sehr geehrter Herr [Nachname], mehrere Fahrzeuge"
  },
  multiple_female: {
    title: "Mehrere Fahrzeuge - Weiblich",
    description: "Sehr geehrte Frau [Nachname], mehrere Fahrzeuge"
  }
};

export default function AdminEmails() {
  const { data: brandings } = useBrandings();
  const activeBranding = brandings?.find(b => b.is_active);
  const { data: templates, isLoading } = useEmailTemplates(activeBranding?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Lade Email-Templates...</div>
      </div>
    );
  }

  if (!activeBranding) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Kein aktives Branding</CardTitle>
            <CardDescription>
              Bitte erstellen Sie zuerst ein Branding unter "Branding".
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
        <p className="text-muted-foreground">
          Verwalten Sie die Email-Vorlagen für die Übersendung von Vertragsunterlagen
        </p>
      </div>

      {/* Variablen-Dokumentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verfügbare Variablen
          </CardTitle>
          <CardDescription>
            Diese Platzhalter werden automatisch durch die entsprechenden Werte ersetzt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs font-mono">%AKTENZEICHEN%</code>
              <span className="text-muted-foreground">Aktenzeichen aus dem Branding</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs font-mono">%NACHNAME%</code>
              <span className="text-muted-foreground">Nachname des Kunden aus der Anfrage</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="bg-muted px-2 py-1 rounded text-xs font-mono">%ANWALT_NAME%</code>
              <span className="text-muted-foreground">Vollständiger Name des Anwalts aus dem Branding</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(templateLabels).map(([type, label]) => {
          const template = templates?.find(t => t.template_type === type);
          
          return (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{label.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {label.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Betreff:</div>
                  <div className="text-muted-foreground text-xs bg-muted/50 p-2 rounded line-clamp-2">
                    {template?.subject || 'Nicht verfügbar'}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {template && (
                    <>
                      <EditEmailTemplateDialog template={template}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                      </EditEmailTemplateDialog>
                      
                      <PreviewEmailTemplateDialog 
                        template={template}
                        branding={activeBranding}
                      >
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Vorschau
                        </Button>
                      </PreviewEmailTemplateDialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
