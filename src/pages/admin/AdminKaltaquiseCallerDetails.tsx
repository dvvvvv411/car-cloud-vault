import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, ArrowLeft, TrendingUp, Calendar, Users, X, Mail, CheckCircle2 } from 'lucide-react';
import { useCallers } from '@/hooks/useColdCallCallers';
import { useCallerCampaigns, useUploadColdCallCampaign } from '@/hooks/useColdCallCampaigns';
import { useBrandings } from '@/hooks/useBranding';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const AdminKaltaquiseCallerDetails = () => {
  const { callerId } = useParams<{ callerId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBrandingId, setSelectedBrandingId] = useState<string>('');

  const { data: callers } = useCallers();
  const { data: campaigns, isLoading: campaignsLoading } = useCallerCampaigns(callerId || '');
  const { data: brandings } = useBrandings();
  const uploadCampaign = useUploadColdCallCampaign();

  const caller = callers?.find((c) => c.id === callerId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        toast({
          title: 'Ungültiger Dateityp',
          description: 'Bitte wählen Sie eine .txt Datei',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Datei zu groß',
          description: 'Die Datei darf maximal 10MB groß sein',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBrandingId || !callerId) {
      toast({
        title: 'Fehlende Angaben',
        description: 'Bitte wählen Sie eine Datei und ein Branding aus',
        variant: 'destructive',
      });
      return;
    }

    await uploadCampaign.mutateAsync({
      callerId,
      brandingId: selectedBrandingId,
      file: selectedFile,
    });

    setSelectedFile(null);
    setSelectedBrandingId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/admin/kaltaquise/${callerId}/${campaignId}`);
  };

  if (!caller) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Caller nicht gefunden</p>
          <Button onClick={() => navigate('/admin/kaltaquise')} className="mt-4">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/kaltaquise')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {caller.first_name} {caller.last_name}
          </h1>
          <p className="text-muted-foreground mt-2 text-base">Cold Call Kampagnen</p>
        </div>
      </div>

      <Card className="modern-card">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            Neue Kampagne erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Leads-Datei (.txt)</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".txt"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Ausgewählt: {selectedFile.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branding-select">Branding</Label>
              <Select value={selectedBrandingId} onValueChange={setSelectedBrandingId}>
                <SelectTrigger id="branding-select">
                  <SelectValue placeholder="Branding auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {brandings?.map((branding) => (
                    <SelectItem key={branding.id} value={branding.id}>
                      {branding.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedBrandingId || uploadCampaign.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadCampaign.isPending ? 'Wird hochgeladen...' : 'Kampagne erstellen'}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Kampagnen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignsLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="modern-hover border-border/40 group cursor-pointer"
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-all">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="group-hover:text-primary transition-colors">
                      {new Date(campaign.campaign_date).toLocaleDateString('de-DE')}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.brandings?.company_name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Gesamt</span>
                      </div>
                      <span className="font-semibold">{campaign.total_leads}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-muted-foreground">Ungültig</span>
                      </div>
                      <span className="font-semibold text-destructive">
                        {campaign.invalid_count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Mailbox</span>
                      </div>
                      <span className="font-semibold text-orange-500">
                        {campaign.mailbox_count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Interessiert</span>
                      </div>
                      <span className="font-semibold text-green-500">
                        {campaign.interested_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Noch keine Kampagnen vorhanden. Erstellen Sie Ihre erste Kampagne.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKaltaquiseCallerDetails;
