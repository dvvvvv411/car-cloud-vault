import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBrandings } from "@/hooks/useBranding";

type System = "insolvenz" | "fahrzeuge";

export const InquiryConfirmationPreview = () => {
  const { data: brandings = [], isLoading: brandingsLoading } = useBrandings();
  const [system, setSystem] = useState<System>("insolvenz");
  const [brandingId, setBrandingId] = useState<string>("");
  const [inquiryId, setInquiryId] = useState<string>("demo");

  // Filter Brandings nach gewähltem System
  const filteredBrandings = useMemo(
    () => brandings.filter((b: any) => (b.branding_type ?? "insolvenz") === system),
    [brandings, system]
  );

  // Branding automatisch wählen, wenn Auswahl leer/ungültig wird
  useEffect(() => {
    if (filteredBrandings.length === 0) {
      setBrandingId("");
      return;
    }
    if (!filteredBrandings.find((b: any) => b.id === brandingId)) {
      setBrandingId(filteredBrandings[0].id);
    }
  }, [filteredBrandings, brandingId]);

  // Beispiel-Anfragen für das gewählte Branding laden
  const { data: inquiries = [] } = useQuery({
    queryKey: ["preview-inquiries", brandingId],
    enabled: !!brandingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("id, first_name, last_name, email, created_at")
        .eq("branding_id", brandingId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Bei Brandingwechsel auf Demo-Daten zurück
  useEffect(() => {
    setInquiryId("demo");
  }, [brandingId]);

  // HTML der Mail rendern lassen
  const { data: preview, isFetching, error } = useQuery({
    queryKey: ["inquiry-confirmation-preview", system, brandingId, inquiryId],
    enabled: !!brandingId,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("preview-inquiry-confirmation", {
        body: {
          system,
          brandingId,
          inquiryId: inquiryId === "demo" ? null : inquiryId,
        },
      });
      if (error) throw error;
      return data as { html: string; subject: string; isDemo: boolean };
    },
  });

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          So sieht die automatisch versendete Bestätigungs-E-Mail aus, die Kunden nach
          dem Absenden einer Anfrage erhalten. Inhaltliche Änderungen am Layout
          erfolgen im Code.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Vorschau-Einstellungen</CardTitle>
          <CardDescription>System, Branding und optional eine echte Beispiel-Anfrage wählen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System</label>
              <Select value={system} onValueChange={(v) => setSystem(v as System)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insolvenz">Insolvenz</SelectItem>
                  <SelectItem value="fahrzeuge">Fahrzeuge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Branding</label>
              {brandingsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : filteredBrandings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Brandings für dieses System.</p>
              ) : (
                <Select value={brandingId} onValueChange={setBrandingId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBrandings.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beispiel-Anfrage</label>
              <Select value={inquiryId} onValueChange={setInquiryId} disabled={!brandingId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Demo-Daten (Max Mustermann)</SelectItem>
                  {inquiries.map((i: any) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.first_name} {i.last_name} · {new Date(i.created_at).toLocaleDateString("de-DE")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
          {preview?.subject && (
            <CardDescription>
              Betreff: <span className="font-medium">{preview.subject}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!brandingId ? (
            <p className="text-sm text-muted-foreground">Bitte ein Branding auswählen.</p>
          ) : isFetching ? (
            <div className="flex items-center justify-center h-[600px] border rounded-md bg-muted/20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              Vorschau konnte nicht geladen werden: {(error as Error).message}
            </p>
          ) : preview?.html ? (
            <div className="flex justify-center bg-muted/20 p-4 rounded-md">
              <iframe
                title="Email-Vorschau"
                srcDoc={preview.html}
                sandbox=""
                className="bg-white border rounded-md shadow-sm"
                style={{ width: 680, height: 800 }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
