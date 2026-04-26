## Problem
`useInquiries` lädt alle Anfragen mit einem einzigen Supabase-Query. Supabase limitiert die Antwort jedoch standardmäßig auf **1000 Zeilen**, weshalb auf `/admin/anfragen` nicht mehr als 1000 Anfragen angezeigt werden.

## Lösung
In `src/hooks/useInquiries.ts` den Query in einer Schleife mit `.range(from, from + 999)` paginieren, bis weniger als 1000 Zeilen zurückkommen. Die Ergebnisse werden zusammengeführt und wie bisher gemappt. Sortierung (`created_at desc`), Branding-Join und Mapping bleiben unverändert.

Keine weiteren Dateien betroffen — `AdminAnfragen.tsx` filtert/sortiert/paginiert clientseitig und nutzt den vollständigen Datensatz automatisch.
