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
  Row,
  Column,
} from 'https://esm.sh/@react-email/components@0.0.17'
import * as React from 'https://esm.sh/react@18.3.1'

interface InquiryConfirmationEmailProps {
  branding: any;
  inquiry: any;
  vehicles: any[];
  logoBase64: string | null;
}

export const InquiryConfirmationEmail = ({
  branding,
  inquiry,
  vehicles,
  logoBase64,
}: InquiryConfirmationEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const totalPrice = vehicles.reduce(
    (sum: number, v: any) => sum + parseFloat(v.price || 0),
    0
  );

  const isSingle = vehicles.length === 1;
  const accent = branding.primary_color || '#1a365d';

  // Singular / Plural texts
  const previewText = isSingle
    ? `Bestätigung Ihrer Anfrage zu folgendem Fahrzeug`
    : `Bestätigung Ihrer Anfrage zu folgenden Fahrzeugen`;
  const introSentence = isSingle
    ? 'wir haben Ihre Anfrage zu folgendem Fahrzeug erhalten:'
    : 'wir haben Ihre Anfrage zu folgenden Fahrzeugen erhalten:';
  const sectionHeading = isSingle
    ? 'Ihr angefragtes Fahrzeug'
    : 'Ihre angefragten Fahrzeuge';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={outerContainer}>
          {/* Card */}
          <Section style={card}>
            {/* Logo */}
            {logoBase64 && (
              <Section style={logoWrapper}>
                <Img src={logoBase64} alt={branding.lawyer_firm_name} style={logo} />
              </Section>
            )}

            {/* Status Badge */}
            <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Text
                style={{
                  ...badge,
                  backgroundColor: `${accent}14`,
                  color: accent,
                }}
              >
                ● Anfrage eingegangen
              </Text>
            </Section>

            {/* Heading */}
            <Heading style={h1}>Vielen Dank für Ihre Anfrage</Heading>

            <Text style={lead}>
              Sehr geehrte/r {inquiry.first_name} {inquiry.last_name},
            </Text>

            <Text style={paragraph}>{introSentence}</Text>

            {/* Vehicles section */}
            <Section style={{ margin: '28px 0 12px' }}>
              <Text style={sectionLabel}>{sectionHeading}</Text>
            </Section>

            <Section style={tableWrapper}>
              <table style={table} cellPadding={0} cellSpacing={0}>
                <thead>
                  <tr>
                    <th style={{ ...th, borderBottom: `2px solid ${accent}` }}>Marke</th>
                    <th style={{ ...th, borderBottom: `2px solid ${accent}` }}>Modell</th>
                    <th style={{ ...thRight, borderBottom: `2px solid ${accent}` }}>Preis (netto)</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle: any, i: number) => (
                    <tr key={i}>
                      <td style={td}>{vehicle.brand}</td>
                      <td style={td}>{vehicle.model}</td>
                      <td style={tdRight}>
                        {formatPrice(parseFloat(vehicle.price || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!isSingle && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={tfootLabel}>Gesamtsumme (netto)</td>
                      <td style={{ ...tfootTotal, color: accent }}>
                        {formatPrice(totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </Section>

            <Text style={netNotice}>
              Alle Preise verstehen sich <strong>netto</strong> zzgl. der
              gesetzlichen Mehrwertsteuer.
            </Text>

            <Hr style={hr} />

            {/* Next Steps */}
            <Heading as="h2" style={h2}>
              Wie geht es weiter?
            </Heading>

            <Section style={stepsBox}>
              <Row style={{ marginBottom: '12px' }}>
                <Column style={stepNumberCol}>
                  <Text style={{ ...stepNumber, backgroundColor: accent }}>1</Text>
                </Column>
                <Column>
                  <Text style={stepText}>
                    <strong>Prüfung Ihrer Anfrage</strong>
                    <br />
                    Wir prüfen Ihre Anfrage und die verfügbaren Unterlagen.
                  </Text>
                </Column>
              </Row>
              <Row style={{ marginBottom: '12px' }}>
                <Column style={stepNumberCol}>
                  <Text style={{ ...stepNumber, backgroundColor: accent }}>2</Text>
                </Column>
                <Column>
                  <Text style={stepText}>
                    <strong>Persönliche Kontaktaufnahme</strong>
                    <br />
                    Rechtsanwalt {branding.lawyer_name} meldet sich in Kürze
                    persönlich bei Ihnen.
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column style={stepNumberCol}>
                  <Text style={{ ...stepNumber, backgroundColor: accent }}>3</Text>
                </Column>
                <Column>
                  <Text style={stepText}>
                    <strong>Abwicklung</strong>
                    <br />
                    Gemeinsam besprechen wir die nächsten Schritte zur
                    Kaufabwicklung.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Footer — kompakt 2 Zeilen */}
            <Section>
              <Text style={footerCompact}>
                <strong style={{ color: '#1a202c' }}>{branding.lawyer_firm_name}</strong>
                {' · '}
                {branding.lawyer_address_street}, {branding.lawyer_address_city}
              </Text>
              <Text style={footerCompact}>
                Tel: {branding.lawyer_phone}
                {' · '}
                <Link href={`mailto:${branding.lawyer_email}`} style={{ ...link, color: accent }}>
                  {branding.lawyer_email}
                </Link>
                {branding.lawyer_website_url && (
                  <>
                    {' · '}
                    <Link
                      href={branding.lawyer_website_url}
                      target="_blank"
                      style={{ ...link, color: accent }}
                    >
                      {branding.lawyer_website_url.replace(/^https?:\/\//, '')}
                    </Link>
                  </>
                )}
              </Text>
            </Section>
          </Section>

          <Text style={legalFooter}>
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie
            direkt auf diese Nachricht, falls Sie Rückfragen haben.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InquiryConfirmationEmail;

// ============== Styles ==============
const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const main = {
  backgroundColor: '#f4f6f8',
  fontFamily: fontStack,
  margin: 0,
  padding: 0,
};

const outerContainer = {
  margin: '0 auto',
  padding: '32px 16px',
  maxWidth: '640px',
};

const card = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '40px 36px',
};

const logoWrapper = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
  maxWidth: '180px',
  width: '100%',
  height: 'auto',
};

const badge = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 600,
  margin: 0,
  letterSpacing: '0.2px',
};

const h1 = {
  color: '#1a202c',
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '0 0 20px',
  textAlign: 'center' as const,
  letterSpacing: '-0.2px',
};

const h2 = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: 700,
  margin: '0 0 16px',
};

const lead = {
  color: '#1a202c',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const paragraph = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
};

const sectionLabel = {
  color: '#718096',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: 0,
};

const vehicleCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '18px 20px',
  marginTop: '12px',
};

const vehicleBrand = {
  color: '#718096',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.8px',
  margin: '0 0 4px',
};

const vehicleModel = {
  color: '#1a202c',
  fontSize: '17px',
  fontWeight: 600,
  lineHeight: '22px',
  margin: 0,
};

const vehiclePrice = {
  fontSize: '18px',
  fontWeight: 700,
  margin: '0',
  lineHeight: '22px',
};

const vehiclePriceNote = {
  color: '#718096',
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '2px 0 0',
};

const totalsBox = {
  marginTop: '16px',
  padding: '16px 20px',
  backgroundColor: '#1a202c',
  borderRadius: '10px',
};

const totalsLabel = {
  color: '#cbd5e0',
  fontSize: '13px',
  fontWeight: 500,
  margin: 0,
  lineHeight: '24px',
};

const totalsValue = {
  fontSize: '20px',
  fontWeight: 700,
  margin: 0,
  color: '#ffffff',
  lineHeight: '24px',
};

const netNotice = {
  color: '#718096',
  fontSize: '12px',
  fontStyle: 'italic' as const,
  textAlign: 'center' as const,
  marginTop: '12px',
  marginBottom: '0',
};

const stepsBox = {
  margin: '8px 0 0',
};

const stepNumberCol = {
  width: '40px',
  verticalAlign: 'top' as const,
};

const stepNumber = {
  color: '#ffffff',
  width: '28px',
  height: '28px',
  borderRadius: '999px',
  display: 'inline-block',
  textAlign: 'center' as const,
  lineHeight: '28px',
  fontSize: '13px',
  fontWeight: 700,
  margin: 0,
};

const stepText = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '20px',
  margin: 0,
};

const hr = {
  borderColor: '#e2e8f0',
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
};

const footerFirm = {
  color: '#1a202c',
  fontSize: '14px',
  fontWeight: 700,
  margin: '0 0 2px',
};

const footerSubtitle = {
  color: '#4a5568',
  fontSize: '13px',
  margin: '0 0 12px',
};

const footerLine = {
  color: '#4a5568',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 10px',
};

const link = {
  textDecoration: 'underline',
};

const legalFooter = {
  color: '#a0aec0',
  fontSize: '11px',
  textAlign: 'center' as const,
  marginTop: '20px',
  lineHeight: '16px',
};
