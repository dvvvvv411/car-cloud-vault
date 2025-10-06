import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.17'
import * as React from 'https://esm.sh/react@18.3.1'

interface ColdCallInterestEmailProps {
  branding: any;
  caller: {
    first_name: string;
    last_name: string;
  };
  password: string;
  brandingSlug: string;
}

export const ColdCallInterestEmail = ({
  branding,
  caller,
  password,
  brandingSlug,
}: ColdCallInterestEmailProps) => {
  const insolvenzLink = `https://insolvenz.kbs-kanzlei.de/insolvenz/${brandingSlug}`;

  return (
    <Html>
      <Head />
      <Preview>Informationen zur Insolvenz der {branding.company_name} – Übernahmemöglichkeiten</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={greeting}>
            Sehr geehrte Damen und Herren,
          </Text>
          
          <Text style={paragraph}>
            wie ich Ihnen im Rahmen meines heutigen Anrufs bereits kurz geschildert habe, befindet sich die {branding.company_name} im Insolvenzverfahren. In diesem Zusammenhang möchten wir Ihnen die Gelegenheit bieten, Fahrzeuge aus der Insolvenzmasse zu übernehmen.
          </Text>
          
          <Text style={paragraph}>
            Zur weiteren Information finden Sie hier die relevanten Quellen:
          </Text>
          
          <Section style={linkSection}>
            <Text style={linkItem}>
              <strong>Pressemitteilung:</strong>{' '}
              <Link href="https://handels-blatt.com/artikel/insolvenz-von-tz-west-gmbh-restbestnde-werden-verkauft" style={link} target="_blank">
                Handelsblatt
              </Link>
            </Text>
            
            <Text style={linkItem}>
              <strong>Insolvenzbekanntmachung:</strong>{' '}
              <Link href="https://insolvenzbekanntmachunqen.de/duesseldorf/tz-west_gmbh.html" style={link} target="_blank">
                Register
              </Link>
            </Text>
            
            <Text style={linkItem}>
              <strong>Unser Klient:</strong>{' '}
              <Link href="https://tz-west.de" style={link} target="_blank">
                TZ-West.de
              </Link>
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={paragraph}>
            Über folgenden Link können Sie die aktuell verfügbaren Positionen einsehen:
          </Text>
          
          <Section style={highlightBox}>
            <Text style={highlightText}>
              <Link href={insolvenzLink} style={highlightLink} target="_blank">
                {insolvenzLink}
              </Link>
            </Text>
            <Text style={passwordText}>
              <strong>Passwort:</strong> {password}
            </Text>
          </Section>
          
          <Text style={paragraph}>
            Dort stehen zu jedem Fahrzeug Bilder, Zustandsberichte sowie die jeweiligen Preise zur Verfügung. Eine Übernahme ist nach kurzer Rückmeldung unkompliziert machbar – selbstverständlich auch für einzelne Fahrzeuge oder kleinere Stückzahlen.
          </Text>
          
          <Text style={paragraph}>
            Falls Sie Fragen haben oder Interesse an bestimmten Fahrzeugen besteht, erreichen Sie uns unkompliziert per E-Mail oder telefonisch unter <strong>0211 54262200</strong> (Mo–Fr, 8:00–18:00 Uhr).
          </Text>
          
          <Text style={paragraph}>
            Vielen Dank für Ihre Zeit im Gespräch vorhin – wir freuen uns auf Ihre Rückmeldung.
          </Text>
          
          {/* Footer / Signature */}
          <Section style={footer}>
            <Text style={signatureName}>
              {caller.first_name} {caller.last_name}
            </Text>
            <Text style={signatureRole}>
              im Auftrag der Insolvenzverwaltung
            </Text>
            <Hr style={footerHr} />
            <Text style={footerText}>
              <strong>{branding.lawyer_firm_name}</strong>
              {branding.lawyer_firm_subtitle && (
                <>
                  <br />
                  {branding.lawyer_firm_subtitle}
                </>
              )}
              <br />
              {branding.lawyer_address_street}
              <br />
              {branding.lawyer_address_city}
              <br /><br />
              Telefon: {branding.lawyer_phone}
              <br />
              E-Mail:{' '}
              <Link href="mailto:info@kbs-kanzlei.de" style={footerLink}>
                info@kbs-kanzlei.de
              </Link>
              <br />
              Web:{' '}
              <Link href={branding.lawyer_website_url} target="_blank" style={footerLink}>
                {branding.lawyer_website_url}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ColdCallInterestEmail

// Styles - Times New Roman, professional and human-like
const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Times New Roman', Times, serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const greeting = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
  marginTop: '20px',
  fontFamily: "'Times New Roman', Times, serif",
}

const paragraph = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const linkSection = {
  margin: '20px 0',
}

const linkItem = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '8px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#cccccc',
  margin: '24px 0',
}

const highlightBox = {
  backgroundColor: '#f5f5f5',
  border: '1px solid #dddddd',
  borderRadius: '4px',
  padding: '20px',
  margin: '20px 0',
}

const highlightText = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '12px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const highlightLink = {
  color: '#0066cc',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const passwordText = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const footer = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #cccccc',
}

const signatureName = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '4px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const signatureRole = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '16px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
  fontStyle: 'italic' as const,
}

const footerHr = {
  borderColor: '#cccccc',
  margin: '12px 0',
}

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '0',
  fontFamily: "'Times New Roman', Times, serif",
}

const footerLink = {
  color: '#0066cc',
  textDecoration: 'underline',
}
