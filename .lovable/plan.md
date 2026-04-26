## Ziel

Zweite SMS-Vorlage hinzufügen: "RG/KV gesendet" — wird automatisch versendet, sobald der Status einer Anfrage auf `RG/KV gesendet` gesetzt wird. Inhalt: Hinweis, dass die Dokumente zur Kaufabwicklung per E‑Mail versendet wurden und das Postfach geprüft werden soll. Auch hier max. 160 Zeichen, parallel zur E‑Mail, via Seven.io.

## Änderungen

### 1. Datenbank
Neue Spalte in `brandings`:
- `sms_documents_sent_template TEXT` mit Default-Vorlage (≤160 Zeichen, ohne Umlaute/ß für GSM-7-Sicherheit):

```
Hallo {vorname}, Ihre Vertragsunterlagen wurden soeben per E-Mail an Sie versendet. Bitte pruefen Sie Ihr Postfach (auch Spam). Ihr Team {kanzlei}
```

### 2. Branding-Schema & Form
- `brandingSchema.ts`: Feld `sms_documents_sent_template` (optional, max. 160) ergänzen.
- `BrandingForm.tsx`: keine sichtbare Änderung nötig — Templates werden weiterhin nur im Preview-Tab bearbeitet (so wie aktuell auch `sms_confirmation_template`). Wert wird im Submit-Payload mitgespeichert (passthrough, falls vorhanden).

### 3. Admin Preview (`/admin/preview` → SMS-Tab)
`SmsConfirmationPreview.tsx` erweitern, sodass beide Vorlagen pro Branding bearbeitbar sind — mit eigener Card, Zeichenzähler, Live-Vorschau und Speichern-Button:
1. Card "SMS Anfrage-Bestätigung" (bestehend, unverändert).
2. Neue Card "SMS Dokumente versendet (RG/KV gesendet)" mit identischer UX, gleichen Platzhaltern (`{vorname}`, `{nachname}`, `{kanzlei}`, `{telefon}`).

### 4. Neue Edge Function `send-documents-sent-sms`
Analog zu `send-inquiry-confirmation-sms`:
- Input: `{ inquiryId }` (Branding wird über Inquiry geladen).
- Lädt Inquiry (first_name, last_name, phone, branding_id) und Branding (seven_api_key, sms_sender_name, sms_documents_sent_template, lawyer_firm_name, lawyer_phone).
- Skippen, wenn SMS nicht konfiguriert oder Telefon ungültig.
- Nutzt dieselbe `normalizePhone`-Logik (E.164-Normalisierung, deutsche Präfixe, Whitespace/Trennzeichen entfernen).
- Sendet via Seven.io REST API (`https://gateway.seven.io/api/sms`) mit `X-Api-Key`, Body als `application/x-www-form-urlencoded` mit `to`, `text`, `from`.
- 160-Zeichen-Cap.

### 5. Trigger beim Statuswechsel
Zwei Stellen, an denen der Status auf `RG/KV gesendet` gesetzt wird:

**a) `useUpdateInquiryStatus` (manueller Wechsel via Dropdown)** — `src/hooks/useInquiryNotes.ts`:
Nach erfolgreichem Update: Wenn `previousStatus !== "RG/KV gesendet"` und `status === "RG/KV gesendet"`, Edge Function via `supabase.functions.invoke('send-documents-sent-sms', { body: { inquiryId } })` aufrufen (fire-and-forget, Fehler nur loggen, Toast nicht blockieren).

**b) `GenerateDocumentsDialog.tsx`** (automatischer Wechsel nach E-Mail-Versand) — direkt nach erfolgreichem `update({ status: "RG/KV gesendet" })` ebenfalls Edge Function aufrufen (fire-and-forget).

So wird die SMS in beiden Flows ausgelöst — egal ob Admin den Status manuell ändert oder durch das Versenden der Dokumente automatisch.

## Technische Details

- Default-Template ist GSM-7-konform (keine Umlaute/ß) → 160 Zeichen, kein Multi-Part SMS.
- Idempotenz: SMS-Versand wird nur ausgelöst, wenn der **vorherige** Status nicht bereits `RG/KV gesendet` war (verhindert Duplikate beim wiederholten Setzen).
- Fehler beim SMS-Versand brechen den Status-Update-Flow nicht ab (try/catch + console.error).
- Branding-Spalte wird automatisch in `types.ts` durch das Migrationssystem aktualisiert.

## Dateien

- `supabase/migrations/<neu>.sql` — Spalte `sms_documents_sent_template` ergänzen.
- `src/lib/validation/brandingSchema.ts` — Feld ergänzen.
- `src/components/admin/BrandingForm.tsx` — Default-Wert + Passthrough im Submit.
- `src/components/admin/SmsConfirmationPreview.tsx` — zweite Template-Card.
- `src/hooks/useBranding.ts` — Typ-Erweiterung (falls dort manuell gepflegt).
- `src/hooks/useInquiryNotes.ts` — SMS-Trigger beim Statuswechsel.
- `src/components/admin/GenerateDocumentsDialog.tsx` — SMS-Trigger nach Auto-Statuswechsel.
- `supabase/functions/send-documents-sent-sms/index.ts` — neu.
