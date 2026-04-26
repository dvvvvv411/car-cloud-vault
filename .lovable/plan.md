## Korrektur: Ein Bot für alle Brandings

Telegram-Bot-Token wird aus den **Supabase Edge Function Secrets** gelesen — nicht mehr pro Branding gespeichert. Pro Branding bleiben nur Chat-ID + Event-Toggles.

## Voraussetzung (du)

Du wirst nach dem Genehmigen aufgefordert, das Secret **`TELEGRAM_BOT_TOKEN`** anzulegen. Wert ist der Token von **@BotFather** (Format: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).

## Änderungen

### 1. Datenbank
Spalte `telegram_bot_token` aus `brandings` entfernen (per Migration). Die anderen Telegram-Spalten bleiben:
- `telegram_chat_id`
- `telegram_notify_new_inquiry`
- `telegram_notify_moechte_rgkv`
- `telegram_notify_rgkv_sent`
- `telegram_notify_amtsgericht_ready`

### 2. Edge Function `send-telegram-notification`
- `botToken` aus `Deno.env.get('TELEGRAM_BOT_TOKEN')` lesen statt aus Branding
- Skip wenn Secret nicht gesetzt ist
- SELECT auf `brandings` lädt `telegram_bot_token` nicht mehr
- Skip-Bedingung nur noch: kein `chat_id` gesetzt

### 3. Edge Function `telegram-get-updates`
- Token-Parameter aus dem Request entfernen — Function liest selbst aus `Deno.env.get('TELEGRAM_BOT_TOKEN')`
- Frontend sendet nur noch `action` und ggf. `chatId`/`text`

### 4. Admin-UI `/admin/telegram` (`AdminTelegram.tsx`)
- Bot-Token-Input + Show/Hide-Button entfernen
- State `botToken`, `showToken` raus
- Hinweis-Box am Anfang: „Bot-Token wird zentral als Supabase Secret `TELEGRAM_BOT_TOKEN` verwaltet — gilt für alle Brandings"
- Setup-Anleitung anpassen: Schritt 1 endet mit „Token kopieren und in Supabase Secrets als `TELEGRAM_BOT_TOKEN` eintragen" (statt unten ins Formular)
- „Chat-ID automatisch erkennen"-Button & „Test-Nachricht"-Button rufen Functions ohne `botToken` auf
- Save-Mutation aktualisiert nur noch Chat-ID + Toggles

### 5. Branding-Schema
Wenn `telegram_bot_token` irgendwo im `Branding`-Type oder in `brandingSchema.ts` referenziert ist — nicht der Fall, also keine Änderung nötig.

## Dateien

- `supabase/functions/send-telegram-notification/index.ts` — Token aus env
- `supabase/functions/telegram-get-updates/index.ts` — Token aus env
- `src/pages/admin/AdminTelegram.tsx` — Token-Input entfernen, UI anpassen
- `supabase/migrations/<neu>.sql` — Spalte `telegram_bot_token` droppen
- **Action:** Secret `TELEGRAM_BOT_TOKEN` anlegen
