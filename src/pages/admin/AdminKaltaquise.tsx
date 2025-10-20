import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Phone, Users, Send, Loader2 } from 'lucide-react';
import { useCallers } from '@/hooks/useColdCallCallers';
import { AddCallerDialog } from '@/components/admin/AddCallerDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickSendLead } from '@/hooks/useLeads';
import { useBrandings } from '@/hooks/useBranding';
import { leadEmailSchema } from '@/lib/validation/coldCallSchema';
import { toast } from '@/hooks/use-toast';

const AdminKaltaquise = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [quickSendEmail, setQuickSendEmail] = useState('');
  const [quickSendBrandingId, setQuickSendBrandingId] = useState('');
  const [quickSendCallerId, setQuickSendCallerId] = useState('');
  
  const { data: callers, isLoading } = useCallers();
  const { data: brandings } = useBrandings();
  const quickSendMutation = useQuickSendLead();
  const navigate = useNavigate();

  const handleQuickSend = async () => {
    // Validate email
    const validation = leadEmailSchema.safeParse({ email: quickSendEmail });
    
    if (!validation.success) {
      toast({
        title: 'Ungültige E-Mail',
        description: validation.error.errors[0]?.message,
        variant: 'destructive',
      });
      return;
    }
    
    if (!quickSendBrandingId) {
      toast({
        title: 'Branding fehlt',
        description: 'Bitte wählen Sie ein Branding aus',
        variant: 'destructive',
      });
      return;
    }
    
    if (!quickSendCallerId) {
      toast({
        title: 'Caller fehlt',
        description: 'Bitte wählen Sie einen Caller aus',
        variant: 'destructive',
      });
      return;
    }
    
    await quickSendMutation.mutateAsync({
      email: validation.data.email,
      brandingId: quickSendBrandingId,
      callerId: quickSendCallerId,
    });
    
    // Reset form on success
    setQuickSendEmail('');
    setQuickSendBrandingId('');
    setQuickSendCallerId('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Kaltaquise</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Verwalten Sie Ihre Caller und deren Cold Call Kampagnen
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Caller hinzufügen
        </Button>
      </div>

      {/* Schnell-Versand Card */}
      <Card className="modern-card border-blue-500/40">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Send className="h-5 w-5" />
            </div>
            Schnell-Versand
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Senden Sie schnell eine E-Mail mit Login-Daten an einen einzelnen Lead
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* E-Mail Input */}
            <div className="space-y-2">
              <Label htmlFor="quick-email">E-Mail-Adresse *</Label>
              <Input
                id="quick-email"
                type="email"
                placeholder="lead@example.com"
                value={quickSendEmail}
                onChange={(e) => setQuickSendEmail(e.target.value)}
                disabled={quickSendMutation.isPending}
              />
            </div>
            
            {/* Branding Select */}
            <div className="space-y-2">
              <Label htmlFor="quick-branding">Branding *</Label>
              <Select 
                value={quickSendBrandingId} 
                onValueChange={setQuickSendBrandingId}
                disabled={quickSendMutation.isPending}
              >
                <SelectTrigger id="quick-branding">
                  <SelectValue placeholder="Branding auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {brandings?.filter(b => b.is_active).map(branding => (
                    <SelectItem key={branding.id} value={branding.id}>
                      {branding.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Caller Select */}
            <div className="space-y-2">
              <Label htmlFor="quick-caller">Caller *</Label>
              <Select 
                value={quickSendCallerId} 
                onValueChange={setQuickSendCallerId}
                disabled={quickSendMutation.isPending}
              >
                <SelectTrigger id="quick-caller">
                  <SelectValue placeholder="Caller auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {callers?.map(caller => (
                    <SelectItem key={caller.id} value={caller.id}>
                      {caller.first_name} {caller.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            onClick={handleQuickSend}
            disabled={!quickSendEmail || !quickSendBrandingId || !quickSendCallerId || quickSendMutation.isPending}
            className="w-full"
          >
            {quickSendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Lead erstellen & E-Mail senden
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : callers && callers.length > 0 ? (
          callers.map((caller) => (
            <Card
              key={caller.id}
              className="modern-hover border-border/40 group cursor-pointer"
              onClick={() => navigate(`/admin/kaltaquise/${caller.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-all">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="group-hover:text-primary transition-colors">
                    {caller.first_name} {caller.last_name}
                  </span>
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
