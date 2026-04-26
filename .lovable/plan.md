Ja, beim Eingang einer Anfrage wird automatisch eine Bestätigungs-E-Mail an den Kunden verschickt — über zwei Edge Functions:
- `send-inquiry-confirmation` (Insolvenz, nutzt Template `inquiry-confirmation.tsx`)
- `send-fahrzeuge-inquiry-confirmation` (Fahrzeuge, nutzt Template `fahrzeuge-inquiry-confirmation.tsx`)

## Ziel

Auf `/admin/emails` einen neuen Reiter „Anfrage-Bestätigung (Vorschau)" einfügen, der eine 1:1-Live-Vorschau dieser automatisch versendeten Bestätigungs-E-Mails zeigt.

## UI-Aufbau

Die Seite `/admin/emails` wird auf eine Tab-Struktur umgestellt:
- Tab 1: „Vertragsunterlagen-Templates" — bestehende Tabelle und Dialoge bleiben unverändert.
- Tab 2: „Anfrage-Bestätigung (Vorschau)" — neuer Vorschau-Bereich.

Im neuen Tab:
- Auswahl „System": Insolvenz oder Fahrzeuge (wechselt zwischen den zwei Templates).
- Auswahl „Branding": Dropdown mit allen aktiven Brandings — bestimmt Logo, Farben, Kanzlei-/Verkäufer-Daten in der Vorschau.
- Auswahl „Beispiel-Anfrage": optionale Auswahl einer echten Anfrage des gewählten Brandings; wenn keine vorhanden, werden Demo-Daten verwendet (Musterkunde, 1–2 Beispiel-Fahrzeuge).
- Anzeige: gerenderte HTML-Vorschau in einem `<iframe srcDoc=...>` mit fester Breite (~640 px), genau so wie die Mail im Postfach erscheint.
- Hinweis-Banner: „So sieht die automatisch versendete Bestätigungs-E-Mail aus. Änderungen am Template erfolgen im Code."

## Technische Umsetzung

Neue Edge Function `preview-inquiry-confirmation`:
- Nimmt `brandingId`, `system` (`insolvenz` | `fahrzeuge`) und optional `inquiryId` entgegen.
- Lädt Branding (und Inquiry, falls `inquiryId` gesetzt) aus der Datenbank — sonst Demo-Daten.
- Verwendet exakt dieselben React-Email-Templates wie die echten Send-Funktionen (`inquiry-confirmation.tsx` bzw. `fahrzeuge-inquiry-confirmation.tsx`) und gibt das gerenderte HTML zurück.
- Verschickt nichts — reine Render-Funktion. Damit bleibt die Vorschau garantiert identisch zur echten Mail, da exakt dieselben Templates verwendet werden.
- Auth: prüft im Code, dass der Aufrufer ein eingeloggter Admin ist (über `has_role`).

Frontend:
- `src/pages/admin/AdminEmails.tsx`: Tabs-Wrapper hinzufügen; bestehende Inhalte in den ersten Tab verschieben; neuen Tab „Anfrage-Bestätigung" anlegen.
- Neue Komponente `src/components/admin/InquiryConfirmationPreview.tsx`:
  - Lädt Brandings (`useBrandings`) und Inquiries pro gewähltem Branding.
  - Ruft die neue Edge Function via `supabase.functions.invoke('preview-inquiry-confirmation', { body: { ... } })` auf.
  - Rendert die Antwort in einem `<iframe>`.
- Neuer Hook `useInquiryConfirmationPreview` für die Mutation/Query.

Keine Datenbankänderungen nötig.

## Was nicht passiert

- Es wird keine zusätzliche Mail verschickt.
- Bestehende Send-Funktionen und Templates werden nicht angefasst.
- Keine neuen Tabellen oder Migrations.