## Ziel

1. SMS-Konfiguration (Seven.io) pro Branding einstellbar machen
2. `/admin/emails` umbenennen in `/admin/preview` mit zusätzlichem Tab "SMS Templates"
3. Automatisches Bestätigungs-SMS, das parallel zur Bestätigungs-Email versendet wird (max. 160 Zeichen, ohne Fahrzeuge), via **Seven.io REST API** (`https://gateway.seven.io/api/sms`)

---

## 1. Datenbank-Änderungen

Migration `brandings` Tabelle: drei neue optionale Spalten
- `seven_api_key text` — Seven.io API Key (pro Branding)
- `sms_sender_name text` — max. 11 Zeichen, alphanumerisch + Leerzeichen
- `sms_confirmation_template text` — Vorlage für Anfrage-Bestätigungs-SMS, mit Platzhaltern wie `{vorname}`, `{nachname}`, `{kanzlei}`, `{telefon}`. Default-Wert:

```
Hallo {vorname}, vielen Dank fuer Ihre Anfrage. Wir melden uns in Kuerze telefonisch bei Ihnen. Ihr Team {kanzlei}
```

(unter 160 Zeichen, ohne Umlaute → GSM-7-kompatibel, vermeidet Multipart-SMS)

## 2. Branding-Form erweitern

`src/lib/validation/brandingSchema.ts`:
- `seven_api_key: z.string().optional()`
- `sms_sender_name: z.string().max(11, 'Maximal 11 Zeichen').optional().or(z.literal(''))`
- `sms_confirmation_template: z.string().max(160, 'Max. 160 Zeichen').optional()`

`src/components/admin/BrandingForm.tsx`:
- Neuer Block **"SMS Konfiguration (Seven.io)"** unter dem Resend-Block mit:
  - Seven.io API Key (password input)
  - SMS-Absendername (max. 11 Zeichen, mit Live-Counter)
  - Hinweis-Text
- `brandingData`-Insert/Update um die drei Felder ergänzen

`src/hooks/useBranding.ts` Interface um die drei Felder erweitern.

## 3. Routing & Navigation umbenennen

- `src/App.tsx`: Route `path="emails"` → `path="preview"` (alt als Redirect zu `/admin/preview` erhalten)
- `src/pages/admin/AdminLayout.tsx`: Nav-Item `Emails` → `Preview`, URL `/admin/emails` → `/admin/preview`
- Datei `AdminEmails.tsx` umbenannt in `AdminPreview.tsx`

## 4. AdminPreview-Seite neu strukturieren

Drei Tabs:
1. **Vertragsunterlagen-Templates** (bestehend)
2. **Anfrage-Bestätigung Email (Vorschau)** (bestehend)
3. **SMS Templates** (neu) — `SmsConfirmationPreview` Komponente

H1 "Emails" → "Preview"

## 5. Neue Komponente `SmsConfirmationPreview`

`src/components/admin/SmsConfirmationPreview.tsx`:
- Branding-Auswahl (Dropdown)
- Beispiel-Anfrage-Auswahl (oder Dummy-Daten)
- Live-Vorschau des SMS-Texts (Platzhalter ersetzt) mit Zeichenzähler `XX / 160`
- Anzeige des konfigurierten Absendernamens
- Hinweis falls Seven.io API Key oder Absendername fehlen → "Diese Branding versendet keine SMS"
- Editor zum Anpassen des `sms_confirmation_template` direkt im Tab (speichert auf `brandings.sms_confirmation_template`)

## 6. Edge Function: `send-inquiry-confirmation-sms`

Neue Function `supabase/functions/send-inquiry-confirmation-sms/index.ts`:
- Input: `{ inquiryId, brandingId }`
- Lädt Branding und Inquiry aus Supabase
- Wenn `seven_api_key` oder `sms_sender_name` fehlt → silent skip
- Ersetzt Platzhalter im Template (`{vorname}`, `{nachname}`, `{kanzlei}`, `{telefon}`)
- Hard-Limit 160 Zeichen (Truncate als Sicherheit)

### Telefonnummern-Normalisierung (zwingend vor Seven.io-Call)

Helper `normalizePhone(raw: string): string | null` in der Edge Function. Regeln in genau dieser Reihenfolge:

1. **Whitespace und Trennzeichen entfernen**: alle Leerzeichen, Tabs, Bindestriche, Schrägstriche, Klammern strippen
   - `+49 691 200 209 8` → `+496912002098`
   - `(0176) 1234-5678` → `017612345678`
2. **Sonstige nicht-Zifferzeichen entfernen** außer führendem `+`
3. **Deutsche Vorwahl normalisieren auf E.164**:
   - Beginnt mit `+49` → unverändert (z.B. `+496912002098`)
   - Beginnt mit `0049` → `+49…` (führende `00` werden zu `+`)
   - Beginnt mit `49` (ohne `+`, ohne `0`) und Länge plausibel → `+49…`
   - Beginnt mit `0` (z.B. `0176…`, `0211…`) → `+49` + Rest ohne führende `0`
     - `0176 12345678` → `+4917612345678`
     - `0211 54262200` → `+4921154262200`
   - Sonst (bereits anderes Land mit `+`, z.B. `+43…`) → unverändert lassen
4. **Validierung**: Ergebnis muss mit `+` beginnen, gefolgt von 8–15 Ziffern. Sonst `null` zurückgeben → SMS skip + Log.

### Seven.io API Call

- POST `https://gateway.seven.io/api/sms`
- Header:
  - `X-Api-Key: <branding.seven_api_key>`
  - `SentWith: Lovable`
  - `Content-Type: application/x-www-form-urlencoded`
- Body (`URLSearchParams`):
  - `to=<normalisierte Nummer>`
  - `text=<gerenderter Text>`
  - `from=<branding.sms_sender_name>`
- Response loggen (`success`, `messages`, `total_price`)
- Bei HTTP-Fehler oder `success !== "100"` → Error loggen, aber nicht weiterwerfen
- Kein verify_jwt nötig
- CORS-Header

## 7. SMS parallel zur Email versenden

`supabase/functions/submit-inquiry/index.ts` erweitern:
- Nach dem Email-Invoke zusätzlich `send-inquiry-confirmation-sms` invoken
- Gilt nur für `branding_type === 'insolvenz'`
- Fehler werden geloggt aber nicht weitergereicht (nicht blockierend)

## 8. Sicherheit

- `seven_api_key` wird nur server-seitig in Edge Functions gelesen (brandings RLS bereits admin-only für Update)
- Kein API-Key im Frontend exponieren

## Nicht betroffen
- Fahrzeuge-System-Email/SMS (zunächst nur Insolvenz)
- Bestehende Email-Templates und Preview bleiben funktional
