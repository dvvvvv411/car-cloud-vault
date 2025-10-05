import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useBrandings } from '@/hooks/useBranding';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BrandingForm } from '@/components/admin/BrandingForm';
import { useToast } from '@/hooks/use-toast';
import type { Branding } from '@/hooks/useBranding';

const AdminBranding = () => {
  const { toast } = useToast();
  const { data: brandings, isLoading, refetch } = useBrandings();
  const [selectedBranding, setSelectedBranding] = useState<Branding | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('brandings')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: 'Branding erfolgreich gelöscht' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Fehler beim Löschen',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedBranding(undefined);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branding-Verwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie verschiedene Branding-Konfigurationen für Insolvenz-Landingpages
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Branding
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Brandings</CardTitle>
          <CardDescription>
            Übersicht aller konfigurierten Brandings und ihre URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lädt...</div>
          ) : brandings && brandings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Aktenzeichen</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandings.map((branding) => (
                  <TableRow key={branding.id}>
                    <TableCell className="font-medium">{branding.company_name}</TableCell>
                    <TableCell>{branding.case_number}</TableCell>
                    <TableCell>
                      <a
                        href={`/insolvenz/${branding.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        /insolvenz/{branding.slug}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={branding.is_active ? 'default' : 'secondary'}>
                        {branding.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBranding(branding);
                            setIsFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(branding.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Brandings vorhanden. Erstellen Sie Ihr erstes Branding.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setSelectedBranding(undefined);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBranding ? 'Branding bearbeiten' : 'Neues Branding erstellen'}
            </DialogTitle>
            <DialogDescription>
              Konfigurieren Sie die Branding-Informationen für eine Insolvenz-Landingpage
            </DialogDescription>
          </DialogHeader>
          <BrandingForm
            branding={selectedBranding}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedBranding(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Branding wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBranding;
