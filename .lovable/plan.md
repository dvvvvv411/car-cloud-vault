

## Filter auf der Amtsgericht-Seite anpassen

### Was wird geaendert

In `src/pages/admin/AdminAmtsgericht.tsx` wird der Filter so angepasst, dass nur Anfragen mit dem exakten Status **"Amtsgericht"** angezeigt werden. Anfragen mit "Amtsgericht Ready" werden nicht mehr auf dieser Seite gelistet, da sie fuer den Amtsgericht-Caller als erledigt gelten.

### Technische Umsetzung

Eine einzige Aenderung in `src/pages/admin/AdminAmtsgericht.tsx` (Zeile 76):

**Vorher:**
```typescript
let filtered = inquiries.filter(i => i.status === "Amtsgericht" || i.status === "Amtsgericht Ready");
```

**Nachher:**
```typescript
let filtered = inquiries.filter(i => i.status === "Amtsgericht");
```

### Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/pages/admin/AdminAmtsgericht.tsx` | Filter auf nur `status === "Amtsgericht"` einschraenken |

