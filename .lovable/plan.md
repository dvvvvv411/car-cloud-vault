
## Neuer Status "Amtsgericht Ready" + Status-History

### Was wird gemacht

1. **Neuer Status "Amtsgericht Ready"** wird zum System hinzugefuegt (DB-Enum, TypeScript-Typen, Dropdowns)
2. Auf `/admin/amtsgericht` wird "Moechte RG/KV" durch "Amtsgericht Ready" ersetzt (erlaubte Status: Amtsgericht, Amtsgericht Ready, Kein Interesse)
3. Auf `/admin/anfragen` wird der neue Status ebenfalls im Dropdown verfuegbar
4. **History-Button** neben dem "Amtsgericht" Titel zeigt ein Popup mit allen Statusaenderungen die auf der Amtsgericht-Seite stattgefunden haben

### Technische Umsetzung

#### 1. Datenbank

**Migration 1: Neuer Enum-Wert**
```sql
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'Amtsgericht Ready' AFTER 'Amtsgericht';
```

**Migration 2: Status-History Tabelle**
```sql
CREATE TABLE amtsgericht_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  old_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  inquiry_name text
);

ALTER TABLE amtsgericht_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view history"
  ON amtsgericht_status_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert history"
  ON amtsgericht_status_history FOR INSERT
  TO authenticated WITH CHECK (true);
```

#### 2. TypeScript-Typen

- `InquiryStatus` in `useInquiries.ts`: hinzufuegen von `"Amtsgericht Ready"`
- `types.ts`: Enum-Werte aktualisieren

#### 3. Status-Dropdown (`InquiryStatusDropdown.tsx`)

- "Amtsgericht Ready" in `STATUS_OPTIONS` einfuegen (nach "Amtsgericht")
- Farbe: **Emerald/Green-600** (`bg-emerald-200 text-emerald-900 border-emerald-400`) - staerker/kraeftiger als das helle Lime von "Amtsgericht", positiv wirkend

#### 4. Amtsgericht-Seite Anpassungen (`AdminAmtsgericht.tsx`)

- `ALLOWED_STATUSES` aendern zu: `["Amtsgericht", "Amtsgericht Ready", "Kein Interesse"]`
- Filter erweitern: Anfragen mit Status "Amtsgericht" ODER "Amtsgericht Ready" anzeigen
- Status-History bei jeder Statusaenderung loggen (inquiry_id, alter Status, neuer Status, User, Name des Kunden)
- **History-Button** (Clock-Icon) neben dem H1-Titel "Amtsgericht"

#### 5. Neuer Hook: `useAmtsgerichtHistory.ts`

- `useAmtsgerichtHistory()` - liest alle History-Eintraege
- `useLogAmtsgerichtStatusChange()` - schreibt einen neuen Eintrag

#### 6. History-Dialog Komponente

- Dialog mit ScrollArea
- Zeigt chronologisch alle Statusaenderungen: Datum, Kundenname, alter Status -> neuer Status, wer geaendert hat
- Farbige Badges fuer die Status

### Dateien die geaendert/erstellt werden

| Datei | Aenderung |
|-------|-----------|
| `supabase/migrations/` | 2 neue Migrationen (Enum + History-Tabelle) |
| `src/integrations/supabase/types.ts` | Enum um "Amtsgericht Ready" erweitern |
| `src/hooks/useInquiries.ts` | `InquiryStatus` Typ erweitern |
| `src/hooks/useAmtsgerichtHistory.ts` | **Neu** - Hook fuer History lesen/schreiben |
| `src/components/admin/InquiryStatusDropdown.tsx` | Neuen Status + Farbe hinzufuegen |
| `src/components/admin/AmtsgerichtHistoryDialog.tsx` | **Neu** - History-Popup Komponente |
| `src/pages/admin/AdminAmtsgericht.tsx` | Allowed statuses aendern, Filter erweitern, History-Button + Logging einbauen |
| `src/pages/admin/AdminAnfragen.tsx` | STATUS_PRIORITY fuer neuen Status ergaenzen |
