

## Plan: Pagination für Admin-Anfragen-Seite (20 pro Seite)

### Problem
Alle Anfragen werden ohne Limit angezeigt, was bei vielen Einträgen zu Lags führt.

### Lösung
Client-seitige Pagination mit 20 Einträgen pro Seite und Navigation am Seitenende.

---

### Technische Änderungen in `src/pages/admin/AdminAnfragen.tsx`

#### 1. Neue State-Variable für aktuelle Seite (nach Zeile 32)

```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 20;
```

#### 2. Pagination-Logik im useMemo erweitern (nach sortedInquiries)

```tsx
const paginatedInquiries = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return sortedInquiries.slice(startIndex, endIndex);
}, [sortedInquiries, currentPage]);

const totalPages = Math.ceil(sortedInquiries.length / ITEMS_PER_PAGE);
```

#### 3. Seite zurücksetzen bei Filter-Änderung

Bei Änderung von `searchQuery`, `showKeinInteresse` oder `selectedStatuses` muss `currentPage` auf 1 zurückgesetzt werden:

```tsx
// In den jeweiligen onChange-Handlern:
setCurrentPage(1);
```

#### 4. Map-Aufrufe ändern

**Desktop (Zeile 395):**
```tsx
{paginatedInquiries.map((inquiry) => (
```

**Mobile (Zeile 532):**
```tsx
{paginatedInquiries.map((inquiry) => (
```

#### 5. Pagination-Navigation hinzufügen (nach der Tabelle/Cards)

Unter beiden Views (Desktop und Mobile) wird eine Pagination-Komponente eingefügt:

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-between mt-6">
    <p className="text-sm text-muted-foreground">
      Zeige {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedInquiries.length)} von {sortedInquiries.length} Anfragen
    </p>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        
        {/* Seitenzahlen */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            // Zeige erste, letzte und Seiten um aktuelle herum
            return page === 1 || 
                   page === totalPages || 
                   Math.abs(page - currentPage) <= 1;
          })
          .map((page, index, array) => (
            <React.Fragment key={page}>
              {index > 0 && array[index - 1] !== page - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

#### 6. Import hinzufügen (Zeile 1-21)

```tsx
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from "@/components/ui/pagination";
```

---

### Ergebnis

| Vorher | Nachher |
|--------|---------|
| Alle Anfragen auf einmal geladen | Nur 20 pro Seite |
| Lags bei vielen Einträgen | Flüssige Performance |
| Kein Page-Indikator | "Zeige X-Y von Z" + Navigation |

### Benutzerfreundlichkeit
- Zurück/Weiter-Buttons
- Seitenzahlen mit Ellipsis für viele Seiten
- Anzeige "Zeige 1-20 von 150 Anfragen"
- Automatischer Reset auf Seite 1 bei Filteränderung

