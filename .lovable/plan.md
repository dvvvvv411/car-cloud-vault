## Ziel

Auf der Seite `/admin/anfragen`:
1. Spalte "Call" entfernen (Desktop-Tabelle).
2. Oberhalb der Liste ein **Aktivitätsprotokoll** anzeigen, das Statuswechsel und neu hinzugefügte Notizen farbig protokolliert (mit Zeitstempel + Nutzer-E-Mail).

## Änderungen im Detail

### 1. Datenbank – neue Tabelle `inquiry_activity_log`
Eine zentrale Aktivitätstabelle für alle relevanten Ereignisse:

```sql
create table public.inquiry_activity_log (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null,
  activity_type text not null,        -- 'status_change' | 'note_added'
  old_value text,                     -- bei status_change: alter Status
  new_value text,                     -- neuer Status oder Notiz-Auszug
  inquiry_name text,                  -- "Vorname Nachname" für schnelle Anzeige
  performed_by uuid,                  -- auth.users.id
  created_at timestamptz not null default now()
);
alter table public.inquiry_activity_log enable row level security;
-- SELECT/INSERT nur für authentifizierte Admins
```
RLS-Policies analog zu `inquiry_notes` (nur Admins).

### 2. Hook `useInquiryActivityLog.ts` (neu)
- `useInquiryActivityLog(limit = 50)` → liest die letzten Einträge inkl. User-E-Mail (über bestehende `get_user_email` RPC).
- `useLogActivity()` → Mutation, fügt einen Eintrag ein (verwendet auth.uid()).

### 3. Auto-Logging bei Statuswechsel
In `useUpdateInquiryStatus` (`src/hooks/useInquiryNotes.ts`):
- Vor dem Update den alten Status laden (oder per Parameter mitgeben), nach erfolgreichem Update einen Eintrag in `inquiry_activity_log` schreiben (`activity_type='status_change'`, `old_value`, `new_value`, `inquiry_name`).
- Beim Aufrufen vom Dropdown wird der alte Status bereits via `currentStatus` Prop übergeben → wir reichen ihn an die Mutation weiter.

### 4. Auto-Logging bei neuer Notiz
In `useCreateInquiryNote` (`src/hooks/useInquiryNotes.ts`):
- Nach erfolgreichem Insert ebenfalls Eintrag in `inquiry_activity_log` mit `activity_type='note_added'`, `new_value` = erste ~80 Zeichen der Notiz, plus `inquiry_name`.

### 5. Neue Komponente `ActivityLogPanel.tsx`
Wird oberhalb der Such-/Filterleiste gerendert. Eigenschaften:
- Card, eingeklappt mit "Aktivitätsprotokoll" Header (Standard: aufgeklappt, scrollbar, max-h ~280px).
- Liste der letzten 30–50 Aktivitäten, neueste zuerst.
- Pro Eintrag farbige linke Border + Badge je nach Typ:
  - `status_change` → Farbe entsprechend neuem Status (gleiche Palette wie `InquiryStatusDropdown`: blau, orange, lime, emerald, lila, grün, grau, rot).
  - `note_added` → Indigo/Violet.
- Anzeige: Icon + "Status geändert: **Alt** → **Neu**" oder "Notiz hinzugefügt: …", Kundenname, Zeitstempel (`dd.MM.yy HH:mm`), Nutzer-E-Mail.

### 6. `AdminAnfragen.tsx`
- `<ActivityLogPanel />` direkt unter der Überschrift einfügen.
- "Call"-Spalte entfernen: `<th className="text-center">Call</th>` und die zugehörige `<td>` mit der Checkbox in der Desktop-Tabelle löschen.
- Mobile-Ansicht und Sortierung nach `call_priority` bleiben unverändert (User hat nur die Spalte angesprochen).

## Technische Hinweise
- Realtime nicht nötig; React-Query invalidiert `["inquiry-activity-log"]` nach jeder Mutation, sodass neue Einträge sofort erscheinen.
- Logging schlägt nicht den ursprünglichen Vorgang fehl: wenn das Insert in `inquiry_activity_log` scheitert, nur Console-Warnung.
