import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Palette } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Branding-Verwaltung</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Verwalten Sie verschiedene Branding-Konfigurationen für Insolvenz-Landingpages
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="shadow-sm hover:shadow-md transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Neues Branding
        </Button>
      </div>

      <Card className="modern-card">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <CardTitle className="text-lg font-semibold">Alle Brandings</CardTitle>
          <CardDescription className="mt-1">
            Übersicht aller konfigurierten Brandings und ihre URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Lädt...</div>
          ) : brandings && brandings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="modern-table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="rounded-tl-lg">Unternehmen</TableHead>
                    <TableHead>Aktenzeichen</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right rounded-tr-lg">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandings.map((branding) => (
                    <TableRow key={branding.id}>
                      <TableCell className="font-semibold text-foreground">{branding.company_name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{branding.case_number}</TableCell>
                      <TableCell>
                        <a
                          href={`/insolvenz/${branding.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors font-medium text-sm"
                        >
                          /insolvenz/{branding.slug}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={branding.is_active ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {branding.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/10 hover:text-primary transition-all"
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
                            className="hover:bg-destructive/10 hover:text-destructive transition-all"
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
            </div>
          ) : (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-4">
                <Palette className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">Noch keine Brandings vorhanden</p>
              <p className="text-sm">Erstellen Sie Ihr erstes Branding, um loszulegen</p>
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
