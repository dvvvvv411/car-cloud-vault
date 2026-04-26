import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Code, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@/assets/neiseke-hagedorn-logo.png";

const buildSignatureHtml = (logoSrc: string) => `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; color: #0a1f3d; font-size: 14px; line-height: 1.5;">
  <tr>
    <td style="padding-bottom: 14px; font-size: 14px; color: #1f2a44;">
      Mit freundlichen Grüßen,
    </td>
  </tr>
  <tr>
    <td>
      <div style="font-size: 16px; font-weight: bold; color: #0a1f3d; margin-bottom: 1px;">Philip Neiseke</div>
      <div style="font-size: 12px; color: #4b5563;">Rechtsanwalt</div>
      <div style="width: 280px; height: 2px; background: #c9a961; margin: 8px 0 12px 0; line-height: 2px; font-size: 0;">&nbsp;</div>
      <div style="margin-bottom: 10px;">
        <img src="${logoSrc}" alt="Neiseke & Hagedorn" width="200" style="display:block; width:200px; height:auto;" />
      </div>
      <div style="font-size: 12px; color: #4b5563; margin-bottom: 6px;">Neiseke &amp; Hagedorn Rechtsanwälte in Partnerschaft PartG mbB</div>
      <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #4b5563;">
        <tr><td style="padding: 1px 0;">Kanzlerstr. 1, 40472 Düsseldorf</td></tr>
        <tr><td style="padding: 1px 0;">Tel: <a href="tel:+4921187971650" style="color:#4b5563; text-decoration:none;">0211 87971650</a></td></tr>
        <tr><td style="padding: 1px 0;">E-Mail: <a href="mailto:p.neiseke@anwaelte-neiseke-hagedorn.de" style="color:#4b5563; text-decoration:none;">p.neiseke@anwaelte-neiseke-hagedorn.de</a></td></tr>
        <tr><td style="padding: 1px 0;">Web: <a href="https://anwaelte-neiseke-hagedorn.de" style="color:#4b5563; text-decoration:none;">anwaelte-neiseke-hagedorn.de</a></td></tr>
      </table>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; max-width: 520px;">
        Diese E-Mail und etwaige Anhänge enthalten vertrauliche und/oder rechtlich geschützte Informationen. Sollten Sie nicht der richtige Adressat sein oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und löschen Sie diese E-Mail. Das unbefugte Kopieren, Weitergeben oder Verwenden dieser E-Mail ist nicht gestattet.
      </div>
    </td>
  </tr>
</table>
`.trim();

const DEFAULT_EDITOR_HTML = `<div style="font-family: Arial, sans-serif; color: #0a1f3d;">
  <h2 style="margin: 0 0 8px 0;">Hallo Welt</h2>
  <p>Hier kannst du <strong>HTML</strong> einfügen und live previewen.</p>
</div>`;

function LiveHtmlEditor() {
  const [html, setHtml] = useState(DEFAULT_EDITOR_HTML);

  const loadSignature = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setHtml(buildSignatureHtml(`${origin}${logoUrl}`));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Live HTML Editor</CardTitle>
            <CardDescription>
              Eigenen HTML-Code einfügen und sofort als Vorschau sehen
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSignature}>
              Aus Signatur laden
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHtml("")}>
              Leeren
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              HTML
            </div>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div>Dein HTML hier...</div>"
              className="min-h-[480px] font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vorschau
            </div>
            <div
              className="border rounded-md p-6 bg-white overflow-auto min-h-[480px]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SignatureCard() {
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

export function EmailSignaturePreview() {
  return (
    <div className="space-y-6">
      <SignatureCard />
      <LiveHtmlEditor />
    </div>
  );
}
