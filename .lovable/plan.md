

## Neuer Status "Amtsgericht" hinzufuegen

### Was wird gemacht

Ein neuer Status "Amtsgericht" wird zum Inquiry-Status-Dropdown hinzugefuegt. Er erscheint zwischen "Moechte RG/KV" und "RG/KV gesendet" und bekommt eine eigene Farbe (Lime/Gelb-Gruen), die bisher nicht verwendet wird.

### Technische Umsetzung

#### 1. Datenbank-Migration

Neuer Enum-Wert fuer den `inquiry_status` Typ:

```sql
ALTER TYPE inquiry_status ADD VALUE IF NOT EXISTS 'Amtsgericht' AFTER 'Möchte RG/KV';
```

#### 2. TypeScript-Typ (`src/hooks/useInquiries.ts`)

`InquiryStatus` um "Amtsgericht" erweitern:

```typescript
export type InquiryStatus = "Neu" | "Möchte RG/KV" | "Amtsgericht" | "RG/KV gesendet" | "Bezahlt" | "Exchanged" | "Kein Interesse";
```

#### 3. Status-Dropdown (`src/components/admin/InquiryStatusDropdown.tsx`)

- "Amtsgericht" in die `STATUS_OPTIONS` Liste einfuegen (nach "Moechte RG/KV")
- Neue Farbe in `getStatusColor`: **Lime** (`bg-lime-100 text-lime-800 border-lime-300 hover:bg-lime-200`)

Bisherige Farben: Blau, Orange, Lila, Gruen, Grau, Rot - Lime ist neu.

#### 4. Supabase Types (`src/integrations/supabase/types.ts`)

Enum-Definition aktualisieren, damit "Amtsgericht" als gueltiger Wert erkannt wird.

### Dateien die geaendert werden

| Datei | Aenderung |
|-------|-----------|
| `supabase/migrations/` | Neue Migration: `ALTER TYPE inquiry_status ADD VALUE` |
| `src/integrations/supabase/types.ts` | Enum um "Amtsgericht" erweitern |
| `src/hooks/useInquiries.ts` | `InquiryStatus` Typ erweitern |
| `src/components/admin/InquiryStatusDropdown.tsx` | Status-Option und Farbe hinzufuegen |

