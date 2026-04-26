Ziel: Auf `/admin/benutzer` pro Benutzer ein Sichtbarkeits-Datum festlegen können. Anfragen, die vor diesem Datum erstellt wurden, werden für diesen Benutzer sofort und ohne Verzögerung ausgeblendet — überall im Admin-Bereich, in dem Anfragen angezeigt werden.

## Funktionsweise aus Nutzersicht

- In der Benutzertabelle gibt es eine neue Spalte „Anfragen sichtbar ab“.
- Pro Benutzer kann ein Datum gesetzt (oder geleert) werden, z. B. `26.04.2026`.
- Sobald das Datum gespeichert ist, sieht dieser Benutzer beim nächsten Render von `/admin/anfragen`, `/admin/amtsgericht` und im Dashboard nur noch Anfragen mit `created_at >= dieses Datum`.
- Admins ohne gesetztes Datum sehen weiterhin alles.
- Filterung passiert **client-seitig** direkt nach dem Laden, damit es ohne Wartezeit/Flicker greift. Zusätzlich wird das Datum auch in der Supabase-Query als `gte('created_at', ...)` mitgegeben, damit gar nicht erst unnötige Daten geladen werden.

## Datenmodell

Neue Spalte in `user_roles`:
- `inquiries_visible_from timestamptz NULL`

Begründung: `user_roles` ist die einzige projekt-eigene Tabelle, die 1:1 zu Auth-Usern existiert. Eine separate Settings-Tabelle wäre Overkill. RLS bleibt unverändert (Admins sehen alles, Nutzer ihre eigene Zeile).

`get_all_users` Funktion wird um die neue Spalte erweitert, damit sie in der Benutzerliste angezeigt werden kann.

Neue RPC oder direkter Update via `user_roles`-Tabelle:
- Da `user_roles` aktuell keine UPDATE-RLS-Policy hat, wird eine Policy ergänzt: Admins dürfen `user_roles` aktualisieren. Damit kann das Datum direkt vom Frontend gesetzt werden.

## UI-Änderungen

`/admin/benutzer` (`AdminBenutzer.tsx`):
- Neue Spalte „Anfragen sichtbar ab“ in der Tabelle.
- Anzeige: formatiertes Datum oder „Alle sichtbar“.
- Button/Datepicker pro Zeile zum Setzen/Ändern. Verwendet wird der Shadcn Datepicker (Popover + Calendar) wie im Code-Style des Projekts.
- Zusätzlich „Zurücksetzen“-Aktion, die das Datum auf `NULL` setzt.

Neuer Hook `useUpdateUserVisibleFrom`:
- Mutation, die `user_roles.inquiries_visible_from` für eine `user_id` setzt.
- Invalidiert `['users']` und `['inquiries']`, damit Listen sofort aktualisiert werden.

## Filter-Logik für Anfragen

Neuer Hook `useCurrentUserVisibleFrom`:
- Liest aus `user_roles` die `inquiries_visible_from` für den aktuell eingeloggten User (`auth.uid()`).
- Wird in `useInquiries` verwendet, um:
  1. die Supabase-Query um `.gte('created_at', visibleFrom)` zu ergänzen, falls gesetzt
  2. zusätzlich nach dem Mapping clientseitig zu filtern (Sicherheitsnetz, falls Cache schon Daten enthält → kein Flicker).

Damit greift die Einschränkung sofort in:
- `/admin/anfragen`
- `/admin/amtsgericht`
- Dashboard-Statistiken (`AdminDashboard.tsx` nutzt `useInquiries`)
- Vehicle-Inquiry-Counts (`useVehicleInquiryCounts.ts`)

Admins ohne gesetztes Datum erleben keinerlei Änderung.

## Edge Cases

- Wenn das Datum in der Zukunft liegt, sieht der Nutzer aktuell keine Anfragen — das ist das gewünschte Verhalten laut Anforderung.
- Beim Entfernen des Datums (auf `NULL` setzen) werden sofort wieder alle Anfragen sichtbar.
- Keine Migration vorhandener Daten nötig: bestehende Spalten bleiben `NULL`.

## Technische Stichpunkte

```text
DB:
  ALTER TABLE user_roles ADD COLUMN inquiries_visible_from timestamptz;
  CREATE POLICY "Admins can update user_roles" ON user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
  Update get_all_users() um inquiries_visible_from mit zurückzugeben.

Frontend:
  - AdminBenutzer.tsx: neue Spalte + Datepicker-Dialog
  - useUsers.ts: User-Type erweitern, neue Mutation useUpdateUserVisibleFrom
  - useInquiries.ts: visibleFrom in Query + Client-Filter
  - neuer Hook useCurrentUserVisibleFrom
```

Keine weiteren Anpassungen am bestehenden Pagination-/Filter-Verhalten, das auf `/admin/anfragen` bereits funktioniert.