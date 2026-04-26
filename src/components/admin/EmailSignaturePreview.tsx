import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Code, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@/assets/neiseke-hagedorn-logo-white.png";

const buildSignatureHtml = (logoSrc: string) => `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; font-size: 14px; line-height: 1.5;">
  <tr>
    <td valign="top" bgcolor="#0f3b5b" style="background-color:#0f3b5b; padding: 16px; border-radius: 6px;">
      <img src="${logoSrc}" alt="Neiseke & Hagedorn" width="140" style="display:block; width:140px; height:auto;" />
    </td>
    <td valign="top" style="padding-left: 20px;">
      <div style="font-size: 16px; font-weight: bold; color: #0f3b5b; margin-bottom: 2px;">Philip Neiseke</div>
      <div style="font-size: 13px; color: #4b5563; margin-bottom: 10px;">Rechtsanwalt</div>
      <div style="font-size: 14px; font-weight: bold; color: #111827;">Neiseke &amp; Hagedorn</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Rechtsanwälte in Partnerschaft PartG mbB</div>
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #374151;">
        <tr><td style="padding: 1px 0;">Kanzlerstr. 1, 40472 Düsseldorf</td></tr>
        <tr><td style="padding: 1px 0;">Tel: <a href="tel:+4921187971650" style="color:#0f3b5b; text-decoration:none;">0211 87971650</a></td></tr>
        <tr><td style="padding: 1px 0;">E-Mail: <a href="mailto:p.neiseke@anwaelte-neiseke-hagedorn.de" style="color:#0f3b5b; text-decoration:none;">p.neiseke@anwaelte-neiseke-hagedorn.de</a></td></tr>
        <tr><td style="padding: 1px 0;">Web: <a href="https://anwaelte-neiseke-hagedorn.de" style="color:#0f3b5b; text-decoration:none;">anwaelte-neiseke-hagedorn.de</a></td></tr>
      </table>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; max-width: 420px;">
        Diese E-Mail kann vertrauliche und/oder rechtlich geschützte Informationen enthalten. Wenn Sie nicht der richtige Adressat sind, informieren Sie bitte den Absender und vernichten Sie diese E-Mail.
      </div>
    </td>
  </tr>
</table>
`.trim();

export function EmailSignaturePreview() {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const previewHtml = useMemo(() => buildSignatureHtml(logoUrl), []);
  const exportHtml = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return buildSignatureHtml(`${origin}${logoUrl}`);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportHtml);
    setCopied(true);
    toast({ title: "HTML kopiert", description: "Die Signatur wurde in die Zwischenablage kopiert." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>E-Mail Signatur – Philip Neiseke</CardTitle>
            <CardDescription>
              Vorschau der HTML-Signatur für Neiseke &amp; Hagedorn (Branding: H- S Immobilien und Kfz Handels GmbH)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("preview")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
            <Button
              variant={view === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("code")}
            >
              <Code className="h-4 w-4 mr-2" />
              HTML Code
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "preview" ? (
          <div
            className="border rounded-md p-6 bg-white overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    In Zwischenablage kopieren
                  </>
                )}
              </Button>
            </div>
            <Textarea
              readOnly
              value={exportHtml}
              className="min-h-[420px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Hinweis: Für den produktiven Einsatz das Logo auf einer dauerhaft öffentlich erreichbaren URL hosten und im HTML ersetzen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
