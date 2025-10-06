import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Branding } from '@/hooks/useBranding';

interface ColdCallEmailPreviewDialogProps {
  branding: Branding;
  caller: {
    first_name: string;
    last_name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColdCallEmailPreviewDialog = ({
  branding,
  caller,
  open,
  onOpenChange,
}: ColdCallEmailPreviewDialogProps) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const generatePreview = async () => {
      const insolvenzLink = `https://insolvenz.kbs-kanzlei.de/insolvenz/${branding.slug}`;
      const dummyPassword = 'ABC12345';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .greeting, .paragraph {
      color: #000000;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 16px;
    }
    .greeting {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .link-section {
      margin: 20px 0;
    }
    .link-item {
      color: #000000;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 8px;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
    .hr {
      border: none;
      border-top: 1px solid #cccccc;
      margin: 24px 0;
    }
    .highlight-box {
      background-color: #f5f5f5;
      border: 1px solid #dddddd;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .highlight-text {
      color: #000000;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 12px;
    }
    .password-text {
      color: #000000;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #cccccc;
    }
    .signature-name {
      color: #000000;
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 4px;
    }
    .signature-role {
      color: #666666;
      font-size: 14px;
      line-height: 20px;
      margin-bottom: 16px;
      font-style: italic;
    }
    .footer-hr {
      border: none;
      border-top: 1px solid #cccccc;
      margin: 12px 0;
    }
    .footer-text {
      color: #666666;
      font-size: 14px;
      line-height: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <p class="greeting">Sehr geehrte Damen und Herren,</p>
    
    <p class="paragraph">
      wie ich Ihnen im Rahmen meines heutigen Anrufs bereits kurz geschildert habe, befindet sich die ${branding.company_name} im Insolvenzverfahren. In diesem Zusammenhang möchten wir Ihnen die Gelegenheit bieten, Fahrzeuge aus der Insolvenzmasse zu übernehmen.
    </p>
    
    <p class="paragraph">Zur weiteren Information finden Sie hier die relevanten Quellen:</p>
    
    <div class="link-section">
      <p class="link-item">
        <strong>Pressemitteilung:</strong>
        <a href="https://handels-blatt.com/artikel/insolvenz-von-tz-west-gmbh-restbestnde-werden-verkauft" target="_blank">Handelsblatt</a>
      </p>
      <p class="link-item">
        <strong>Insolvenzbekanntmachung:</strong>
        <a href="https://insolvenzbekanntmachunqen.de/duesseldorf/tz-west_gmbh.html" target="_blank">Register</a>
      </p>
      <p class="link-item">
        <strong>Unser Klient:</strong>
        <a href="https://tz-west.de" target="_blank">TZ-West.de</a>
      </p>
    </div>
    
    <hr class="hr">
    
    <p class="paragraph">Über folgenden Link können Sie die aktuell verfügbaren Positionen einsehen:</p>
    
    <div class="highlight-box">
      <p class="highlight-text">
        <a href="${insolvenzLink}" target="_blank">${insolvenzLink}</a>
      </p>
      <p class="password-text"><strong>Passwort:</strong> ${dummyPassword}</p>
    </div>
    
    <p class="paragraph">
      Dort stehen zu jedem Fahrzeug Bilder, Zustandsberichte sowie die jeweiligen Preise zur Verfügung. Eine Übernahme ist nach kurzer Rückmeldung unkompliziert machbar – selbstverständlich auch für einzelne Fahrzeuge oder kleinere Stückzahlen.
    </p>
    
    <p class="paragraph">
      Falls Sie Fragen haben oder Interesse an bestimmten Fahrzeugen besteht, erreichen Sie uns unkompliziert per E-Mail oder telefonisch unter <strong>0211 54262200</strong> (Mo–Fr, 8:00–18:00 Uhr).
    </p>
    
    <p class="paragraph">
      Vielen Dank für Ihre Zeit im Gespräch vorhin – wir freuen uns auf Ihre Rückmeldung.
    </p>
    
    <hr class="hr">
    
    <div class="footer">
      <p class="signature-name">${caller.first_name} ${caller.last_name}</p>
      <p class="signature-role">im Auftrag der Insolvenzverwaltung</p>
      <hr class="footer-hr">
      <p class="footer-text">
        <strong>${branding.lawyer_firm_name}</strong><br>
        ${branding.lawyer_firm_subtitle ? `${branding.lawyer_firm_subtitle}<br>` : ''}
        ${branding.lawyer_address_street}<br>
        ${branding.lawyer_address_city}<br><br>
        Telefon: ${branding.lawyer_phone}<br>
        E-Mail: <a href="mailto:info@kbs-kanzlei.de">info@kbs-kanzlei.de</a><br>
        Web: <a href="${branding.lawyer_website_url}" target="_blank">${branding.lawyer_website_url}</a>
      </p>
    </div>
  </div>
</body>
</html>
      `;

      setHtmlContent(html);
    };

    if (open) {
      generatePreview();
    }
  }, [branding, caller, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            E-Mail Vorschau - Interessiert
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-lg bg-white">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full min-h-[600px]"
            title="Email Preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
