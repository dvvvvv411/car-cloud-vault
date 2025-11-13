-- Phase 1: Add salutation field to inquiries table

-- Create enum for salutation
CREATE TYPE salutation_type AS ENUM ('Herr', 'Frau');

-- Add salutation column to inquiries table
ALTER TABLE inquiries 
ADD COLUMN salutation salutation_type NULL;

COMMENT ON COLUMN inquiries.salutation IS 'Anrede des Kunden (Herr/Frau)';

-- Phase 3: Create email_templates table

-- Create enum for template types
CREATE TYPE email_template_type AS ENUM (
  'single_male',
  'single_female',
  'multiple_male',
  'multiple_female'
);

-- Create email_templates table
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branding_id uuid REFERENCES brandings(id) ON DELETE CASCADE,
  template_type email_template_type NOT NULL,
  subject text NOT NULL DEFAULT 'Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(branding_id, template_type)
);

COMMENT ON TABLE email_templates IS 'Email-Vorlagen für verschiedene Anrede- und Fahrzeugkombinationen';
COMMENT ON COLUMN email_templates.template_type IS 'Art des Templates: single/multiple × male/female';
COMMENT ON COLUMN email_templates.subject IS 'Email-Betreff (kann %AKTENZEICHEN% Variable enthalten)';
COMMENT ON COLUMN email_templates.body IS 'Email-Körper in Plain Text mit Variablen';

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert email templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete email templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_brandings_updated_at();

-- Insert initial templates for all brandings
INSERT INTO email_templates (branding_id, template_type, body)
SELECT 
  b.id,
  template_type,
  CASE template_type
    WHEN 'single_male' THEN 
'Sehr geehrter Herr %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu dem von Ihnen ausgewählten Fahrzeug. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
    
    WHEN 'single_female' THEN 
'Sehr geehrte Frau %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu dem von Ihnen ausgewählten Fahrzeug. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
    
    WHEN 'multiple_male' THEN 
'Sehr geehrter Herr %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu den von Ihnen ausgewählten Fahrzeugen. Im Einzelnen finden Sie im Anhang:

• die Kaufverträge,
• die Treuhandverträge,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferungen – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
    
    WHEN 'multiple_female' THEN 
'Sehr geehrte Frau %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu den von Ihnen ausgewählten Fahrzeugen. Im Einzelnen finden Sie im Anhang:

• die Kaufverträge,
• die Treuhandverträge,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferungen – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
  END
FROM brandings b
CROSS JOIN (
  VALUES 
    ('single_male'::email_template_type),
    ('single_female'::email_template_type),
    ('multiple_male'::email_template_type),
    ('multiple_female'::email_template_type)
) AS t(template_type);