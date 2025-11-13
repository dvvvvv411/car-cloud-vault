-- Delete all branding-specific email templates
DELETE FROM email_templates WHERE branding_id IS NOT NULL;

-- Create 4 global email templates with placeholders
INSERT INTO email_templates (template_type, branding_id, subject, body)
VALUES 
(
  'single_male',
  NULL,
  'Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)',
  'Sehr geehrter Herr %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu dem von Ihnen ausgewählten Fahrzeug. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
),
(
  'single_female',
  NULL,
  'Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)',
  'Sehr geehrte Frau %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu dem von Ihnen ausgewählten Fahrzeug. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
),
(
  'multiple_male',
  NULL,
  'Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)',
  'Sehr geehrter Herr %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu den von Ihnen ausgewählten Fahrzeugen. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
),
(
  'multiple_female',
  NULL,
  'Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)',
  'Sehr geehrte Frau %NACHNAME%,

wie besprochen, erhalten Sie anbei die vollständigen Unterlagen zu den von Ihnen ausgewählten Fahrzeugen. Im Einzelnen finden Sie im Anhang:

• den Kaufvertrag,
• den Treuhandvertrag,
• sowie die dazugehörige Rechnung.

Wir möchten Sie bitten, den auf der Rechnung ausgewiesenen Betrag fristgerecht auf das angegebene Konto zu überweisen. Nach Zahlungseingang werden wir umgehend die weiteren Schritte zur Abwicklung – einschließlich der Vorbereitung der Fahrzeugauslieferung – veranlassen.

Bitte senden Sie uns nach erfolgter Überweisung einen Zahlungsnachweis bzw. eine kurze Bestätigung per E-Mail zu, damit wir den Vorgang entsprechend vermerken und fortsetzen können.

Sollten Sie zu den Vertragsunterlagen, der Zahlungsabwicklung oder dem weiteren Ablauf Fragen haben, stehen Ihnen Herr Rechtsanwalt %ANWALT_NAME% sowie ich selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen'
);