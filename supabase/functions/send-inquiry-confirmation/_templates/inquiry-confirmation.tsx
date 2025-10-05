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
      currency: 'EUR'
    }).format(price);
  };

  const totalPrice = vehicles.reduce((sum: number, v: any) => sum + parseFloat(v.price || 0), 0);

  return (
    <Html>
      <Head />
      <Preview>Bestätigung Ihrer Fahrzeuganfrage - {branding.company_name}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          {logoBase64 && (
            <Img
              src={logoBase64}
              width="180"
              alt={branding.lawyer_firm_name}
              style={logo}
            />
          )}
          
          {/* Header */}
          <Heading style={h1}>
            Vielen Dank für Ihre Anfrage
          </Heading>
          
          <Text style={text}>
            Sehr geehrte/r {inquiry.first_name} {inquiry.last_name},
          </Text>
          
          <Text style={text}>
            wir haben Ihre Anfrage zu folgenden Fahrzeugen erhalten:
          </Text>
          
          {/* Vehicles Table */}
          <Section style={tableContainer}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Marke</th>
                  <th style={th}>Modell</th>
                  <th style={thRight}>Preis</th>
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
              <tfoot>
                <tr>
                  <td colSpan={2} style={tfootLabel}>Gesamtsumme:</td>
                  <td style={tfootTotal}>
                    {formatPrice(totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Section>
          
          <Hr style={hr} />
          
          {/* Next Steps */}
          <Text style={text}>
            Unser Rechtsanwalt <strong>{branding.lawyer_name}</strong> wird sich in Kürze 
            persönlich mit Ihnen in Verbindung setzen, um die weiteren Schritte zu besprechen.
          </Text>
          
          <Hr style={hr} />
          
          {/* Footer */}
          <Text style={footer}>
            <strong>{branding.lawyer_firm_name}</strong><br />
            {branding.lawyer_firm_subtitle && <>{branding.lawyer_firm_subtitle}<br /></>}
            {branding.lawyer_address_street}<br />
            {branding.lawyer_address_city}<br /><br />
            
            Telefon: {branding.lawyer_phone}<br />
            E-Mail: <Link href={`mailto:${branding.lawyer_email}`} style={link}>
              {branding.lawyer_email}
            </Link><br />
            Web: <Link href={branding.lawyer_website_url} target="_blank" style={link}>
              {branding.lawyer_website_url}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InquiryConfirmationEmail

// Professional, serious styles for law firm
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
}

const logo = {
  margin: '0 auto 30px',
  display: 'block',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  marginTop: '0',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
  marginTop: '0',
}

const tableContainer = {
  margin: '24px 0',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const th = {
  textAlign: 'left' as const,
  padding: '12px',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 'bold',
  color: '#1a1a1a',
  fontSize: '14px',
}

const thRight = {
  textAlign: 'right' as const,
  padding: '12px',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 'bold',
  color: '#1a1a1a',
  fontSize: '14px',
}

const td = {
  padding: '12px',
  borderBottom: '1px solid #e0e0e0',
  color: '#333333',
  fontSize: '14px',
}

const tdRight = {
  padding: '12px',
  borderBottom: '1px solid #e0e0e0',
  color: '#333333',
  fontSize: '14px',
  textAlign: 'right' as const,
}

const tfootLabel = {
  padding: '12px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  color: '#1a1a1a',
  fontSize: '14px',
}

const tfootTotal = {
  padding: '12px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  fontSize: '18px',
  color: '#2563eb',
}

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
}

const footer = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '20px',
  marginTop: '30px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}