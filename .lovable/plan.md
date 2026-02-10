

## TransferButton auch bei "Amtsgericht Ready" anzeigen

### Was wird geaendert

In `src/pages/admin/AdminAnfragen.tsx` wird die Bedingung fuer die Anzeige des TransferButtons und GenerateDocumentsDialog erweitert, sodass diese nicht nur bei Status "Moechte RG/KV" sondern auch bei "Amtsgericht Ready" erscheinen.

### Technische Umsetzung

Zwei Stellen in `AdminAnfragen.tsx` muessen angepasst werden:

**Zeile 610 (Desktop-Ansicht):**
```
Vorher:  inquiry.status === "Möchte RG/KV"
Nachher: (inquiry.status === "Möchte RG/KV" || inquiry.status === "Amtsgericht Ready")
```

**Zeile 751 (Mobile-Ansicht):**
```
Vorher:  inquiry.status === "Möchte RG/KV"
Nachher: (inquiry.status === "Möchte RG/KV" || inquiry.status === "Amtsgericht Ready")
```

### Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/pages/admin/AdminAnfragen.tsx` | Bedingung an 2 Stellen erweitern (Zeile 610 + 751) |

