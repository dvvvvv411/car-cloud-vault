

## Plan: Button umbenennen & Branding-Filter hinzufügen

### Änderung 1: Button umbenennen (Zeile 344)

**Vorher:**
```tsx
Anreden automatisch zuweisen
```

**Nachher:**
```tsx
Anreden zuweisen
```

---

### Änderung 2: Branding-Filter hinzufügen (nach Status-Filter, vor Anreden-Button)

Neuer Filter zwischen Status-Filter (Zeile 328) und Anreden-Button (Zeile 329):

#### 2.1 Neue State-Variable (nach Zeile 40)

```tsx
const [selectedBrandings, setSelectedBrandings] = useState<string[]>([]);
```

#### 2.2 Unique Brandings aus Inquiries extrahieren (im useMemo-Bereich)

```tsx
const uniqueBrandings = useMemo(() => {
  const brandings = inquiries
    .filter(i => i.brandings?.company_name)
    .map(i => ({
      id: i.branding_id!,
      name: i.brandings!.company_name
    }));
  
  // Deduplizieren nach ID
  return Array.from(new Map(brandings.map(b => [b.id, b])).values());
}, [inquiries]);
```

#### 2.3 Filter in sortedInquiries erweitern

```tsx
// Nach Status-Filter, vor Suchfilter:
if (selectedBrandings.length > 0) {
  filtered = filtered.filter((inquiry) => 
    inquiry.branding_id && selectedBrandings.includes(inquiry.branding_id)
  );
}
```

#### 2.4 Branding-Filter UI (zwischen Status-Filter und Anreden-Button)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="whitespace-nowrap w-full sm:w-auto">
      <Building className="h-4 w-4 mr-2" />
      Branding Filter
      {selectedBrandings.length > 0 && (
        <Badge variant="secondary" className="ml-2">
          {selectedBrandings.length}
        </Badge>
      )}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="w-56 bg-background z-50">
    <DropdownMenuLabel>Branding auswählen</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {uniqueBrandings.map((branding) => (
      <DropdownMenuCheckboxItem
        key={branding.id}
        checked={selectedBrandings.includes(branding.id)}
        onCheckedChange={(checked) => {
          setSelectedBrandings(prev =>
            checked
              ? [...prev, branding.id]
              : prev.filter(id => id !== branding.id)
          );
          setCurrentPage(1);
        }}
      >
        {branding.name}
      </DropdownMenuCheckboxItem>
    ))}
    {selectedBrandings.length > 0 && (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setSelectedBrandings([]);
            setCurrentPage(1);
          }}
          className="text-destructive"
        >
          Filter zurücksetzen
        </DropdownMenuItem>
      </>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Reihenfolge der Filter-Elemente nach Änderung

| Position | Element |
|----------|---------|
| 1 | Suchfeld |
| 2 | Status Filter (Dropdown) |
| 3 | **Branding Filter (Dropdown)** ← NEU |
| 4 | **Anreden zuweisen** (Button) ← UMBENANNT |
| 5 | "Kein Interesse" Toggle |

---

### Technische Details

- `Building` Icon wird bereits importiert (Zeile 5)
- Branding-Daten sind bereits in `inquiry.brandings?.company_name` verfügbar
- Filter-Reset setzt auch `currentPage` auf 1 zurück

