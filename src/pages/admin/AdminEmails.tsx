import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { EditEmailTemplateDialog } from "@/components/admin/EditEmailTemplateDialog";
import { PreviewEmailTemplateDialog } from "@/components/admin/PreviewEmailTemplateDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminEmails() {
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<any>(null);
  const { data: templates, isLoading } = useEmailTemplates();

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      'single_male': 'Herr - 1 Fahrzeug',
      'single_female': 'Frau - 1 Fahrzeug',
      'multiple_male': 'Herr - Mehrere Fahrzeuge',
      'multiple_female': 'Frau - Mehrere Fahrzeuge'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Templates</h2>
        <p className="text-muted-foreground">
          Verwalten Sie die Email-Vorlagen für Vertragsunterlagen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Templates</CardTitle>
          <CardDescription>
            4 verschiedene Vorlagen für unterschiedliche Anreden und Fahrzeuganzahl
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Letzte Änderung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {getTemplateLabel(template.template_type)}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {template.subject}
                  </TableCell>
                  <TableCell>
                    {new Date(template.updated_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewingTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Vorschau
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditEmailTemplateDialog
        template={editingTemplate}
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      />

      <PreviewEmailTemplateDialog
        template={previewingTemplate}
        open={!!previewingTemplate}
        onOpenChange={(open) => !open && setPreviewingTemplate(null)}
      />
    </div>
  );
}
