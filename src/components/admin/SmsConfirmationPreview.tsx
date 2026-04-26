import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BrandingRow {
  id: string;
  company_name: string;
  lawyer_firm_name: string;
  lawyer_phone: string;
  seven_api_key: string | null;
  sms_sender_name: string | null;
  sms_confirmation_template: string | null;
}

const DEFAULT_TEMPLATE =
  'Hallo {vorname}, vielen Dank fuer Ihre Anfrage. Wir melden uns in Kuerze telefonisch bei Ihnen. Ihr Team {kanzlei}';

const renderTemplate = (
  tpl: string,
  data: { vorname: string; nachname: string; kanzlei: string; telefon: string }
) =>
  tpl
    .split('{vorname}').join(data.vorname)
    .split('{nachname}').join(data.nachname)
    .split('{kanzlei}').join(data.kanzlei)
    .split('{telefon}').join(data.telefon);

export const SmsConfirmationPreview = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedBrandingId, setSelectedBrandingId] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const { data: brandings, isLoading } = useQuery({
    queryKey: ['brandings-sms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brandings')
        .select(
          'id, company_name, lawyer_firm_name, lawyer_phone, seven_api_key, sms_sender_name, sms_confirmation_template'
        )
        .eq('branding_type', 'insolvenz')
        .order('company_name');
      if (error) throw error;
      return data as BrandingRow[];
    },
  });

  const branding = useMemo(
    () => brandings?.find((b) => b.id === selectedBrandingId),
    [brandings, selectedBrandingId]
  );

  // Init selection + template when brandings load or selection changes
  useEffect(() => {
    if (brandings && brandings.length > 0 && !selectedBrandingId) {
      setSelectedBrandingId(brandings[0].id);
    }
  }, [brandings, selectedBrandingId]);

  useEffect(() => {
    if (branding) {
      setTemplate(branding.sms_confirmation_template || DEFAULT_TEMPLATE);
    }
  }, [branding]);

  const rendered = useMemo(
    () =>
      renderTemplate(template, {
        vorname: 'Max',
        nachname: 'Mustermann',
        kanzlei: branding?.lawyer_firm_name || 'Kanzlei',
        telefon: branding?.lawyer_phone || '',
      }),
    [template, branding]
  );

  const charCount = template.length;
  const renderedCount = rendered.length;

  const hasSms = !!branding?.seven_api_key && !!branding?.sms_sender_name;

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('brandings')
        .update({ sms_confirmation_template: template })
        .eq('id', branding.id);
      if (error) throw error;
      toast({ title: 'SMS-Vorlage gespeichert' });
      qc.invalidateQueries({ queryKey: ['brandings-sms'] });
    } catch (err: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!brandings || brandings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Keine Insolvenz-Brandings vorhanden.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Anfrage-Bestätigung
          </CardTitle>
          <CardDescription>
            Wird parallel zur Bestätigungs-Email per Seven.io versendet (max. 160 Zeichen).
            Verfügbare Platzhalter: <code>{'{vorname}'}</code>, <code>{'{nachname}'}</code>,{' '}
            <code>{'{kanzlei}'}</code>, <code>{'{telefon}'}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Branding</Label>
            <Select value={selectedBrandingId} onValueChange={setSelectedBrandingId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brandings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!hasSms && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                Diese Branding versendet aktuell <strong>keine SMS</strong>. Es fehlen{' '}
                {!branding?.seven_api_key && <code>Seven.io API Key</code>}
                {!branding?.seven_api_key && !branding?.sms_sender_name && ' und '}
                {!branding?.sms_sender_name && <code>SMS-Absendername</code>}. Im Branding-Formular
                ergänzen.
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="sms_template">SMS-Vorlage</Label>
              <span
                className={`text-xs tabular-nums ${
                  charCount > 160 ? 'text-destructive font-semibold' : 'text-muted-foreground'
                }`}
              >
                Vorlage: {charCount}/160
              </span>
            </div>
            <Textarea
              id="sms_template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              maxLength={160}
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || charCount > 160}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vorlage speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live-Vorschau</CardTitle>
          <CardDescription>
            Mit Beispiel-Daten (Max Mustermann) und den Werten aus der gewählten Branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Absender:</span>
            <Badge variant="secondary">
              {branding?.sms_sender_name || '— nicht konfiguriert —'}
            </Badge>
            <span className="ml-auto tabular-nums">
              Versand: {renderedCount}/160
            </span>
          </div>
          <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {rendered}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
