

## Benutzer-Zugriff anpassen

### Was wird geaendert

In `src/pages/admin/AdminLayout.tsx` werden die Zugriffsregeln fuer zwei Benutzer angepasst:

1. **amtsgericht@caller.de** (ID: `32a4a326-41b8-4dc6-be0d-f3defa261c8d`) — sieht ausschliesslich den Reiter "Amtsgericht" und wird sofort dorthin weitergeleitet
2. **x959@caller.de** (ID: `8d7a682d-5d5e-43ff-8b73-513464eb16fc`) — sieht "Anfragen" UND "Amtsgericht" (bisher nur "Anfragen"), wird bei `/admin` auf `/admin/anfragen` weitergeleitet

### Technische Umsetzung

In `src/pages/admin/AdminLayout.tsx`:

- Neue Konstante `AMTSGERICHT_ONLY_USER_ID = '32a4a326-41b8-4dc6-be0d-f3defa261c8d'`
- `isAmtsgerichtOnlyUser` Flag hinzufuegen
- `INQUIRY_ONLY_USER_ID` (`x959@caller.de`) bekommt jetzt Zugriff auf `/admin/anfragen` **und** `/admin/amtsgericht`
- Die `visibleNavItems` Logik wird angepasst:
  - `amtsgericht@caller.de` → nur `['/admin/amtsgericht']`
  - `x959@caller.de` → `['/admin/anfragen', '/admin/amtsgericht']`
  - `kaltaquise`-User → wie bisher nur `['/admin/kaltaquise']`
  - Alle anderen → alle Reiter
- Redirect-Logik im `useEffect`:
  - `amtsgericht@caller.de` bei `/admin` → redirect zu `/admin/amtsgericht`
  - `x959@caller.de` bei `/admin` → redirect zu `/admin/anfragen` (wie bisher)
- Passwort-aendern Button: auch fuer `amtsgericht@caller.de` sichtbar machen

### Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/pages/admin/AdminLayout.tsx` | Neue User-ID Konstante, angepasste Filter- und Redirect-Logik |

