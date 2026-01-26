

## Plan: Pagination auf 10 pro Seite ändern & Navigation-Abstände verbessern

### Änderungen in `src/pages/admin/AdminAnfragen.tsx`

#### 1. ITEMS_PER_PAGE von 20 auf 10 ändern (Zeile 42)

**Vorher:**
```tsx
const ITEMS_PER_PAGE = 20;
```

**Nachher:**
```tsx
const ITEMS_PER_PAGE = 10;
```

#### 2. Pagination-Navigation mit mehr Abständen (Zeilen 703-744)

**Vorher:**
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious ... />
    </PaginationItem>
    {/* Seitenzahlen */}
    <PaginationItem>
      <PaginationNext ... />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

**Nachher:**
```tsx
<Pagination>
  <PaginationContent className="gap-2">
    <PaginationItem>
      <PaginationPrevious ... />
    </PaginationItem>
    
    <div className="flex items-center gap-1 mx-4">
      {/* Seitenzahlen mit gap-1 zwischen den Zahlen */}
    </div>
    
    <PaginationItem>
      <PaginationNext ... />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Konkrete Styling-Verbesserungen

| Element | Änderung |
|---------|----------|
| `PaginationContent` | `className="gap-2"` für Grundabstand |
| Seitenzahlen-Container | `mx-4` für Abstand zu Zurück/Weiter |
| Zwischen Seitenzahlen | `gap-1` für leichten Abstand |

### Ergebnis
- 10 Anfragen pro Seite statt 20
- Mehr Platz zwischen "Zurück" und Seitenzahlen
- Mehr Platz zwischen Seitenzahlen und "Weiter"
- Bessere visuelle Trennung der Navigation

