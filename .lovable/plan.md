

## Mailbox-Button in der Notizen-Spalte

### Was wird gemacht

Neben dem "Notiz hinzufuegen" Button im Notizen-Dialog kommt ein neuer "Mailbox" Button. Wenn man darauf klickt, wird ein spezieller Eintrag vom Typ "mailbox" erstellt. In der Notizen-Spalte der Tabelle werden diese dann als "MB 1", "MB 2" etc. Badges angezeigt (analog zu "Notiz 1", "Notiz 2").

### Technische Umsetzung

#### 1. Datenbank: Neue Spalte `note_type`

Eine neue Spalte `note_type` (TEXT, default `'note'`) wird zur Tabelle `inquiry_notes` hinzugefuegt. Moegliche Werte: `'note'` (Standard) und `'mailbox'`.

```sql
ALTER TABLE inquiry_notes ADD COLUMN note_type text NOT NULL DEFAULT 'note';
```

#### 2. Hook: `useInquiryNotes.ts`

- Das `InquiryNote` Interface bekommt ein neues Feld `note_type: 'note' | 'mailbox'`
- Die `useCreateInquiryNote` Mutation bekommt einen optionalen Parameter `noteType` (default `'note'`)
- Beim Insert wird `note_type` mitgeschickt

#### 3. Dialog: `InquiryNotesDialog.tsx`

- Neben dem "Notiz hinzufuegen" Button kommt ein "Mailbox" Button (z.B. mit Mail-Icon)
- Klick auf "Mailbox" erstellt sofort einen Eintrag mit `note_type: 'mailbox'` und einem leeren oder automatischen Text (z.B. "Mailbox-Eintrag")
- In der ScrollArea werden Mailbox-Eintraege mit "MB X" Label statt "Notiz X" angezeigt

#### 4. Badges in der Tabellen-Spalte (DialogTrigger)

- Die Badges werden nach Typ getrennt angezeigt:
  - Regulaere Notizen: "Notiz 1", "Notiz 2" (wie bisher)
  - Mailbox-Eintraege: "MB 1", "MB 2" (eigene Farbe, z.B. orange/gelb)
- Die Nummerierung laeuft pro Typ separat

### Dateien die geaendert werden

| Datei | Aenderung |
|-------|-----------|
| `supabase/migrations/` | Neue Migration fuer `note_type` Spalte |
| `src/integrations/supabase/types.ts` | Wird automatisch aktualisiert |
| `src/hooks/useInquiryNotes.ts` | `note_type` zum Interface und zur Mutation hinzufuegen |
| `src/components/admin/InquiryNotesDialog.tsx` | Mailbox-Button, getrennte Badge-Anzeige, MB-Labels im Dialog |

