import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Phone } from 'lucide-react';
import { useCallers } from '@/hooks/useColdCallCallers';
import { AddCallerDialog } from '@/components/admin/AddCallerDialog';
import { Skeleton } from '@/components/ui/skeleton';

const AdminKaltaquise = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { data: callers, isLoading } = useCallers();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kaltaquise</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Caller und deren Cold Call Kampagnen
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Caller hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : callers && callers.length > 0 ? (
          callers.map((caller) => (
            <Card
              key={caller.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/admin/kaltaquise/${caller.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  {caller.first_name} {caller.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Erstellt am {new Date(caller.created_at).toLocaleDateString('de-DE')}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Noch keine Caller vorhanden. Erstellen Sie Ihren ersten Caller.
          </div>
        )}
      </div>

      <AddCallerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
};

export default AdminKaltaquise;
