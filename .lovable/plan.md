## Problem

Auf der `/insolvenz`-Seite (`src/pages/Index.tsx`) wird das Gerichtsbeschluss-PDF-Thumbnail im Header per `sm:absolute sm:top-0 sm:right-0` rechts oben im Container positioniert. Der darunterliegende Text "Übersicht an verfügbaren Positionen aus der Insolvenzmasse der …" und ggf. die Überschrift "Insolvenzmasse" haben jedoch keinen rechten Innenabstand, weshalb der längere Firmenname (z. B. "H- S Immobilien und Kfz Handels GmbH") hinter das Thumbnail läuft und visuell abgeschnitten wirkt.

## Lösung

Dem Textbereich (Headline + Paragraph) reservierten rechten Platz geben, sodass der Text vor dem absolut positionierten Thumbnail umbricht statt darunter durchzulaufen.

### Änderungen in `src/pages/Index.tsx`

1. **Wrapper um Headline + Paragraph (Zeilen ~377–386)**: Beide Elemente (`<div className="mb-2">` mit `<h1>Insolvenzmasse</h1>` und das `<p>` darunter) in einen gemeinsamen Wrapper mit responsivem Padding-Right legen, das genau die Breite des Thumbnails + Badge + Gap freihält:
   - Mobil/Tablet: kein Padding (Thumbnail ist dort nicht absolut positioniert bzw. steht oberhalb)
   - `sm`: rund `pr-[8rem]` (Thumbnail ~6–7rem)
   - `lg`: `lg:pr-[330px]` (Badge `Az: 502 IN 14/25` + Gap + 180px Thumbnail)

2. Alternativ – falls sauberer – stattdessen im äußeren `flex-1` Container (Zeile 256) ein konditionales `lg:pr-[330px] sm:pr-[8rem]` setzen, sodass alle Inhalte unterhalb des absolut positionierten Thumbnails automatisch Platz lassen.

Empfohlen wird Variante 2, da sie auch zukünftige Inhalte schützt und nur eine Stelle ändert.

### Konkrete Edit

Zeile 256:
```tsx
<div className="flex-1 relative min-h-[6rem] md:min-h-[8rem] w-full">
```
→
```tsx
<div className="flex-1 relative min-h-[6rem] md:min-h-[8rem] w-full sm:pr-[9rem] lg:pr-[340px]">
```

Damit bricht der Text "Übersicht an verfügbaren Positionen aus der Insolvenzmasse der H- S Immobilien und Kfz Handels GmbH." vor dem Thumbnail um und überlappt nicht mehr.

## Tests / Verifikation

- Branding mit langem `company_name` (H- S Immobilien und Kfz Handels GmbH) auf Desktop (≥1024px): Text muss vor Thumbnail umbrechen.
- Mobile (<640px): Thumbnail steht oberhalb (kein absolutes Layout aktiv) – Layout darf nicht brechen.
- Branding ohne `court_decision_pdf_url`: nur Bild-Variante, gleiche Position – ebenfalls geschützt.

## Betroffene Datei

- `src/pages/Index.tsx` (eine Zeile)
