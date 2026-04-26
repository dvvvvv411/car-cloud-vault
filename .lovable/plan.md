# Telegram-Integration vollständig globalisieren

Aktuell ist die Telegram-Konfiguration noch pro Branding gespeichert (`telegram_chat_id`, `telegram_notify_*` auf der `brandings`-Tabelle), obwohl wir nur EINEN globalen Bot haben. Das ergibt keinen Sinn — eine Chat-Gruppe für alle Notifications. Branding wird nur noch als **Info im Text** der Nachricht erwähnt.

## Was sich ändert

### 1. Neue globale Settings-Tabelle
Neue Tabelle `telegram_settings` (Singleton, eine Zeile):
- `id` (fixed = 1)
- `chat_id` (text, nullable)
- `notify_new_inquiry` (bool, default true)
- `notify_moechte_rgkv` (bool, default true)
- `notify_rgkv_sent` (bool, default true)
- `notify_amtsgericht_ready` (bool, default true)
- `updated_at`

RLS: Nur Admins lesen/schreiben.

### 2. Migration: alte Spalten entfernen
Drop auf `brandings`:
- `telegram_chat_id`
- `telegram_notify_new_inquiry`
- `telegram_notify_moechte_rgkv`
- `telegram_notify_rgkv_sent`
- `telegram_notify_amtsgericht_ready`

### 3. Edge Function `send-telegram-notification`
- Liest Chat-ID + Event-Toggles aus `telegram_settings` statt aus `brandings`
- Branding-Name kommt weiterhin als Feld in den Nachrichtentext (über die `branding_id` der Anfrage joinen)
- Token bleibt aus `TELEGRAM_BOT_TOKEN` Secret

### 4. Edge Function `telegram-get-updates`
- Bleibt fast identisch (nutzt schon den globalen Token)
- Test-Nachricht bekommt Chat-ID direkt mitgegeben (wie jetzt)

### 5. UI `/admin/telegram` (`AdminTelegram.tsx`)
**Komplett neu, ohne Branding-Auswahl:**
- Hinweis-Karte: Bot-Token wird als Supabase Secret verwaltet
- Setup-Anleitung (1× Bot erstellen, 1× in Gruppe einladen, Chat-ID erkennen)
- **Eine** Chat-ID-Eingabe + „Chat-ID automatisch erkennen"-Button
- **Eine** Liste der 4 Event-Checkboxes (gilt global)
- „Speichern" + „Test-Nachricht senden"
- Beispiel-Vorschau

## Technische Details

- Migration legt `telegram_settings` an, seedet Zeile mit `id=1` und übernimmt — falls vorhanden — die erste nicht-leere `telegram_chat_id` aus `brandings` als Default, dann werden die Spalten gedroppt.
- `send-telegram-notification` Aufrufe in `submit-inquiry` und `useInquiryNotes`/`GenerateDocumentsDialog` ändern sich nicht in der Signatur (nehmen weiter `inquiry_id` + `event_type`); nur die Function intern liest aus der neuen Tabelle.
- `src/integrations/supabase/types.ts` wird automatisch von der Migration aktualisiert.

## Dateien

- **Neu:** `supabase/migrations/<timestamp>_telegram_global_settings.sql`
- **Bearbeitet:** `src/pages/admin/AdminTelegram.tsx` (Branding-Auswahl raus)
- **Bearbeitet:** `supabase/functions/send-telegram-notification/index.ts`
- **Bearbeitet (minor):** `supabase/functions/telegram-get-updates/index.ts` (nur Cleanup falls nötig)
- **Auto-aktualisiert:** `src/integrations/supabase/types.ts`

Nach Approval setze ich das direkt um.
