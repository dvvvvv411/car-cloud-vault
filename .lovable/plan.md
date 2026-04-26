## Ziel

Telegram-Bot-Benachrichtigungen einbauen, die bei bestimmten Ereignissen automatisch in eine Telegram-Gruppe gepostet werden:

1. Neue Anfrage eingegangen
2. Status auf "Möchte RG/KV" gesetzt
3. Status auf "RG/KV gesendet" gesetzt
4. Status auf "Amtsgericht Ready" gesetzt

Die Konfiguration (Bot-Token + Chat-IDs) wird pro Branding in einem neuen Admin-Tab `/admin/telegram` gepflegt.

## Schritt-für-Schritt Anleitung (für dich)

### 1. Telegram-Bot erstellen
1. Öffne Telegram und suche nach **@BotFather**
2. Sende `/newbot`
3. Wähle einen Namen (z. B. "Kanzlei Notifications")
4. Wähle einen Username (muss auf `bot` enden, z. B. `kanzlei_notify_bot`)
5. BotFather schickt dir den **Bot-Token** (Format: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
6. **Token kopieren** — den brauchst du gleich

### 2. Bot in deine Gruppe einladen
1. Erstelle eine Telegram-Gruppe (oder nutze eine bestehende)
2. Tippe oben auf den Gruppennamen → **Mitglieder hinzufügen** → suche deinen Bot per Username → hinzufügen
3. **Wichtig:** Sende mindestens **eine Nachricht** in die Gruppe (z. B. "test"), sonst kann der Bot die Chat-ID nicht ermitteln
4. Gehe in `/admin/telegram` → Klick **"Chat-ID automatisch erkennen"** → System ruft `getUpdates` auf und zeigt alle Chats an, in denen der Bot aktiv ist → du wählst die richtige Gruppe aus
   - Alternativ kannst du die Chat-ID auch manuell eintragen (Gruppen-IDs starten typischerweise mit `-100...`)

### 3. In Lovable konfigurieren
1. Gehe zu `/admin/telegram`
2. Wähle ein Branding aus
3. Trage **Bot-Token** und **Chat-ID** ein
4. Aktiviere die gewünschten Notification-Trigger (Checkboxen)
5. Klick **Test-Nachricht senden** — sollte sofort in der Gruppe ankommen

Ab dann laufen Notifications automatisch.

## Änderungen im System

### 1. Datenbank
Neue Spalten in `brandings`:
- `telegram_bot_token TEXT` — Bot-Token von BotFather
- `telegram_chat_id TEXT` — Ziel-Gruppen/Chat-ID
- `telegram_notify_new_inquiry BOOLEAN DEFAULT true`
- `telegram_notify_moechte_rgkv BOOLEAN DEFAULT true`
- `telegram_notify_rgkv_sent BOOLEAN DEFAULT true`
- `telegram_notify_amtsgericht_ready BOOLEAN DEFAULT true`

(Pro-Branding-Konfiguration, weil unterschiedliche Kanzleien unterschiedliche Gruppen haben können.)

### 2. Neue Edge Function `send-telegram-notification`
Eingabe: `{ inquiryId, eventType }` mit `eventType` ∈ `'new_inquiry' | 'moechte_rgkv' | 'rgkv_sent' | 'amtsgericht_ready'`

Logik:
- Inquiry + Branding laden
- Prüfen ob `telegram_bot_token` & `telegram_chat_id` gesetzt sind
- Prüfen ob entsprechender Trigger-Flag aktiv ist (sonst skip)
- Nettopreis berechnen: `total_price` ist brutto (inkl. 19% MwSt.) → netto = `total_price / 1.19` (nur für Insolvenz-Branding; bei Fahrzeuge entsprechend)
- Nachricht formatieren (HTML parse_mode):

```
🆕 Neue Anfrage   (oder 📝 Möchte RG/KV / 📤 RG/KV gesendet / ⚖️ Amtsgericht Ready)

👤 Name: Max Mustermann
🏢 Firma: Mustermann GmbH        (nur wenn vorhanden)
🎨 Branding: Kanzlei XY
📞 Telefon: +49 176 12345678
💶 Nettopreis: 12.500,00 €
```

- POST an `https://api.telegram.org/bot<TOKEN>/sendMessage` mit `chat_id`, `text`, `parse_mode: HTML`
- Fehler nur loggen, nicht blockieren

**Hinweis:** Telegram ist als Lovable-Connector verfügbar, aber dort teilen sich alle Workspaces ein Bot-Token. Da du pro Branding eigene Bots/Gruppen willst, nutzen wir die direkte Telegram Bot API mit den Tokens aus `brandings` — kein Connector nötig.

### 3. Neue Edge Function `telegram-get-updates`
Hilfs-Function für die "Chat-ID automatisch erkennen"-Funktion:
- Eingabe: `{ botToken }`
- Ruft `https://api.telegram.org/bot<TOKEN>/getUpdates` auf
- Gibt alle eindeutigen Chats zurück: `[{ id, title, type }]`
- So sieht der Admin alle Gruppen, in denen der Bot Nachrichten gesehen hat

### 4. Trigger-Integrationen
**a) Neue Anfrage** — `supabase/functions/submit-inquiry/index.ts`:
Nach erfolgreichem Insert, parallel zu E-Mail/SMS: `supabase.functions.invoke('send-telegram-notification', { body: { inquiryId, eventType: 'new_inquiry' }})`

**b) Status-Wechsel** — `src/hooks/useInquiryNotes.ts` (`useUpdateInquiryStatus`):
Nach erfolgreichem Status-Update, beim Übergang in einen der drei Trigger-Stati:
```
if (previousStatus !== status) {
  if (status === "Möchte RG/KV") invoke('send-telegram-notification', { inquiryId, eventType: 'moechte_rgkv' })
  if (status === "RG/KV gesendet") invoke(..., 'rgkv_sent')
  if (status === "Amtsgericht Ready") invoke(..., 'amtsgericht_ready')
}
```

**c) Auto-Wechsel nach Dokumentenversand** — `GenerateDocumentsDialog.tsx`:
Nach Auto-Status-Wechsel auf "RG/KV gesendet" zusätzlich Telegram triggern (analog zur SMS-Logik).

Idempotenz: nur triggern beim **Übergang** in den Status, nie bei wiederholtem Setzen desselben Status.

### 5. Neue Admin-Seite `/admin/telegram`

**Route:** `src/App.tsx` → `<Route path="telegram" element={<AdminTelegram />} />`

**Sidebar:** `src/pages/admin/AdminLayout.tsx` → neuer Eintrag "Telegram" mit `Send`-Icon (oder `MessageCircle`)

**Neue Datei:** `src/pages/admin/AdminTelegram.tsx`
Layout pro Branding (Cards untereinander, ähnlich wie SMS-Preview):
- **Branding-Auswahl** (oder Card pro Branding)
- **Setup-Anleitung** (kurze visuelle Schritte: BotFather → Token → Bot in Gruppe → Chat-ID erkennen)
- **Bot-Token Input** (password-style mit Show/Hide)
- **Chat-ID Input** + Button **"Chat-ID automatisch erkennen"** → Modal mit Liste der Gruppen aus `getUpdates`, Klick wählt aus
- **4 Checkboxen** für die Trigger-Events
- **Vorschau-Box**: zeigt eine Beispiel-Nachricht im finalen Format
- **Buttons:** "Speichern" und "Test-Nachricht senden" (sendet sofort eine Beispiel-Notification an die Gruppe)

### 6. Schema/Form Updates
- `src/lib/validation/brandingSchema.ts` — neue Felder optional ergänzen (passthrough)
- `src/hooks/useBranding.ts` — Typ-Erweiterung wenn manuell gepflegt
- `src/components/admin/BrandingForm.tsx` — keine sichtbare Änderung; Werte werden nur in `/admin/telegram` bearbeitet (analog zu SMS-Templates)

## Technische Details

- **Nettopreis-Berechnung:** Insolvenz speichert netto in `total_price` (verifizieren in Code), Fahrzeuge speichert brutto → entsprechend umrechnen. Im Doubt: ich prüfe vor Implementierung in `useInquiries.ts` / `useGenerateDocuments.ts` die genaue Konvention.
- **Number-Formatting:** Deutsches Format `12.500,00 €` via `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`
- **HTML-Escape:** Namen/Firmen mit `<`, `>`, `&` müssen escaped werden bevor sie in `parse_mode: HTML` Nachrichten landen
- **Fehler-Robustheit:** Telegram-Versand ist fire-and-forget; Fehler werden geloggt aber blockieren nie den Hauptflow (Anfrage/Statuswechsel)
- **Sicherheit:** Bot-Token nur server-side via Edge Function lesen; nie im Frontend ausgeben (Input bleibt password-Type, beim Speichern Wert nicht zurückspielen)

## Dateien

**Neu:**
- `supabase/migrations/<neu>.sql` — 6 neue Spalten in `brandings`
- `supabase/functions/send-telegram-notification/index.ts`
- `supabase/functions/telegram-get-updates/index.ts`
- `src/pages/admin/AdminTelegram.tsx`

**Edits:**
- `src/App.tsx` — Route
- `src/pages/admin/AdminLayout.tsx` — Sidebar-Eintrag
- `src/lib/validation/brandingSchema.ts` — Felder ergänzen
- `src/hooks/useBranding.ts` — Typen
- `src/hooks/useInquiryNotes.ts` — Status-Trigger
- `src/components/admin/GenerateDocumentsDialog.tsx` — Auto-Status-Trigger
- `supabase/functions/submit-inquiry/index.ts` — neuer-Anfrage-Trigger
