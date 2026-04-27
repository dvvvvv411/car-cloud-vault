Ich habe die aktuellen Logs und den Code geprüft. Für die letzte Anfrage wurde die SMS laut Seven.io tatsächlich um 06:47:49 versendet, aber mit dem damals noch gespeicherten alten Text. Deine Template-Änderung wurde erst danach um 06:51:51 gespeichert. Das erklärt den alten Inhalt.

Was trotzdem falsch/gefährlich ist: Der SMS-Versand läuft aktuell „fire-and-forget“. Wenn Seven.io ablehnt, das Branding keine SMS-Daten hat, die Nummer ungültig ist oder der Aufruf nicht startet, sieht der Admin nur „Status aktualisiert“ bzw. Telegram kommt an, aber kein klarer SMS-Fehler. Außerdem sollte der Trigger zentraler abgesichert werden.

Plan zur Korrektur:

1. Statuswechsel „RG/KV gesendet“ robuster machen
- Den bestehenden Status-Update-Hook so erweitern, dass die SMS-Funktion nicht nur im Hintergrund stumm gestartet wird.
- Bei „RG/KV gesendet“ soll der SMS-Aufruf ausgewertet werden.
- Wenn die SMS übersprungen oder abgelehnt wurde, wird eine konkrete Meldung angezeigt, z. B. „SMS nicht gesendet: SMS im Branding nicht konfiguriert“ oder „Telefonnummer ungültig“.

2. Dokumenten-Workflow angleichen
- Im Dialog, der Dokumente verschickt und danach den Status auf „RG/KV gesendet“ setzt, wird dieselbe SMS-Auswertung eingebaut.
- Damit ist egal, ob der Status per Dropdown oder nach Dokumentenversand gesetzt wird: SMS und Fehleranzeige verhalten sich gleich.

3. Edge Function klarere Antworten liefern lassen
- `send-documents-sent-sms` gibt bereits Gründe wie `sms_not_configured`, `invalid_phone`, `no_branding` zurück.
- Ich ergänze/vereinheitliche die Rückgabe so, dass Frontend und Logs eindeutig unterscheiden können zwischen:
  - erfolgreich gesendet
  - übersprungen wegen fehlender SMS-Konfiguration
  - ungültige Telefonnummer
  - Seven.io-Fehler
  - Anfrage/Branding nicht gefunden

4. Admin-Feedback verbessern
- Nach Statuswechsel soll die Erfolgsmeldung nicht mehr so tun, als wäre alles erledigt, wenn die SMS fehlt.
- Vorgesehen:
  - Status geändert + SMS gesendet: Erfolgsmeldung
  - Status geändert + Telegram gesendet, aber SMS fehlgeschlagen/übersprungen: Warnmeldung mit Grund
  - Statusänderung fehlgeschlagen: Fehlermeldung wie bisher

5. SMS-Template-Auswahl absichern
- In der SMS-Template-Preview wird das aktive SMS-Branding bevorzugt vorausgewählt, damit man nicht wieder versehentlich ein Branding ohne SMS-Konfiguration bearbeitet.
- Brandings ohne `seven_api_key` oder `sms_sender_name` werden klar als „SMS inaktiv“ markiert.

Technische Details:
- Betroffene Dateien:
  - `src/hooks/useInquiryNotes.ts`
  - `src/components/admin/GenerateDocumentsDialog.tsx`
  - `src/components/admin/SmsConfirmationPreview.tsx`
  - optional kleine Anpassung in `supabase/functions/send-documents-sent-sms/index.ts`
- Keine Datenbankänderung nötig.
- Nach Umsetzung wird die Edge Function neu deployed und mit der betroffenen Anfrage getestet, ohne eine doppelte SMS an echte Kunden auszulösen, sofern möglich über Logik-/Response-Test statt Realversand.