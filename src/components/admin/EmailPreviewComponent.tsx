import { useEffect, useState } from 'react';
import type { Branding } from '@/hooks/useBranding';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EmailPreviewComponentProps {
  branding: Branding;
}

export const EmailPreviewComponent = ({ branding }: EmailPreviewComponentProps) => {
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const generateStaticPreview = () => {
      // Dummy data for preview
      const dummyVehicles = [
        { brand: 'Mercedes-Benz', model: 'C-Klasse', price: 15000 },
        { brand: 'BMW', model: '3er', price: 18000 }
      ];
      
      const totalPrice = dummyVehicles.reduce((sum, v) => sum + v.price, 0);
      
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR'
        }).format(price);
      };

      // Generate HTML preview
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f6; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header with Logo -->
                    ${branding.kanzlei_logo_url ? `
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center;">
                        <img src="${branding.kanzlei_logo_url}" alt="${branding.lawyer_firm_name}" style="max-width: 180px; height: auto;" />
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: ${branding.kanzlei_logo_url ? '20px' : '40px'} 40px 40px 40px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 0 0 20px 0;">
                          Vielen Dank für Ihre Anfrage
                        </h1>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                          Sehr geehrte/r Max Mustermann,
                        </p>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                          wir haben Ihre Anfrage zu folgenden Fahrzeugen erhalten:
                        </p>
                        
                        <!-- Vehicles Table -->
                        <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse: collapse; margin: 24px 0;">
                          <thead>
                            <tr style="border-bottom: 2px solid #e0e0e0;">
                              <th style="text-align: left; font-weight: bold; color: #1a1a1a; font-size: 14px;">Marke</th>
                              <th style="text-align: left; font-weight: bold; color: #1a1a1a; font-size: 14px;">Modell</th>
                              <th style="text-align: right; font-weight: bold; color: #1a1a1a; font-size: 14px;">Preis</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${dummyVehicles.map(vehicle => `
                              <tr style="border-bottom: 1px solid #e0e0e0;">
                                <td style="padding: 12px 0; color: #333333; font-size: 14px;">${vehicle.brand}</td>
                                <td style="padding: 12px 0; color: #333333; font-size: 14px;">${vehicle.model}</td>
                                <td style="padding: 12px 0; color: #333333; font-size: 14px; text-align: right;">${formatPrice(vehicle.price)}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colspan="2" style="padding: 12px 0; font-weight: bold; text-align: right; color: #1a1a1a;">Gesamtsumme:</td>
                              <td style="padding: 12px 0; font-weight: bold; text-align: right; font-size: 18px; color: #2563eb;">${formatPrice(totalPrice)}</td>
                            </tr>
                          </tfoot>
                        </table>
                        
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
                        
                        <!-- Next Steps -->
                        <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
                          Unser Rechtsanwalt <strong>${branding.lawyer_name}</strong> wird sich in Kürze 
                          persönlich mit Ihnen in Verbindung setzen, um die weiteren Schritte zu besprechen.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
                        
                        <!-- Footer -->
                        <div style="font-size: 14px; color: #666666; line-height: 20px; margin-top: 30px;">
                          <p style="margin: 0 0 8px 0;"><strong>${branding.lawyer_firm_name}</strong></p>
                          ${branding.lawyer_firm_subtitle ? `<p style="margin: 0 0 8px 0;">${branding.lawyer_firm_subtitle}</p>` : ''}
                          <p style="margin: 0 0 4px 0;">${branding.lawyer_address_street}</p>
                          <p style="margin: 0 0 12px 0;">${branding.lawyer_address_city}</p>
                          
                          <p style="margin: 0 0 4px 0;">Telefon: ${branding.lawyer_phone}</p>
                          <p style="margin: 0 0 4px 0;">E-Mail: <a href="mailto:${branding.lawyer_email}" style="color: #2563eb; text-decoration: underline;">${branding.lawyer_email}</a></p>
                          <p style="margin: 0;">Web: <a href="${branding.lawyer_website_url}" style="color: #2563eb; text-decoration: underline;">${branding.lawyer_website_url}</a></p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
      
      setPreviewHtml(html);
    };

    generateStaticPreview();
  }, [branding]);

  if (!branding.resend_api_key || !branding.resend_sender_email) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          E-Mail-Konfiguration nicht vollständig. Bitte konfigurieren Sie Resend API Key und Absender-E-Mail, 
          um die E-Mail-Vorschau zu sehen.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <iframe
        srcDoc={previewHtml}
        className="w-full h-[600px] border-0"
        title="Email Preview"
      />
    </div>
  );
};