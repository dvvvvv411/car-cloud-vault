## Problem

In `src/components/LawyerContactCard.tsx` (verwendet auf `/insolvenz`) wird das Anwaltsfoto als `<img src={lawyerPhotoUrl} />` gerendert. Damit kann der Nutzer:
- per Rechtsklick → "Bild speichern unter" das Originalbild herunterladen
- per Drag & Drop das Bild auf den Desktop ziehen
- per "Bild untersuchen" / DevTools direkt die `src`-URL als `<img>`-Element sehen und öffnen

Gewünscht: Bild soll für den User möglichst geschützt sein.

## Lösung

Vollständiger Schutz im Browser ist technisch nicht möglich (jeder Inhalt landet im Cache und ist im Network-Tab einsehbar). Wir reduzieren aber alle gängigen Wege deutlich:

1. `<img>` durch ein `<div>` mit `background-image` ersetzen — dadurch:
   - kein Rechtsklick → "Bild speichern unter" mehr (nur generisches Kontextmenü, ohne Bild-Optionen)
   - kein "Bild in neuem Tab öffnen"
   - im "Element untersuchen"-Inspector erscheint kein `<img>`-Tag, sondern nur ein leeres `<div>` mit CSS — die URL ist nur in der CSS-Eigenschaft sichtbar
2. Zusätzlich:
   - `onContextMenu={(e) => e.preventDefault()}` blockiert das Kontextmenü komplett über dem Bildbereich
   - `onDragStart={(e) => e.preventDefault()}` und `draggable={false}` verhindern Drag & Drop
   - `select-none`, `WebkitUserSelect: 'none'`, `WebkitTouchCallout: 'none'` verhindern Auswahl/Long-Press auf iOS
   - `pointer-events-none` auf dem inneren Bild-Div (Klicks auf Card bleiben weiter möglich, da die Card-Wrapper-Klicks darüberliegen — falls nicht erforderlich, lassen wir es weg, um Kontextmenü-Handler aktiv zu halten). → Wir lassen `pointer-events-none` weg, damit die Event-Handler (`onContextMenu`, `onDragStart`) aktiv bleiben.

### Konkrete Änderung in `src/components/LawyerContactCard.tsx` (Zeilen 51–55)

Ersetze:
```tsx
<img 
  src={lawyerPhotoUrl} 
  alt={`Rechtsanwalt ${lawyerName}`}
  className="w-32 h-32 rounded-full object-cover shadow-lg"
/>
```

durch:
```tsx
<div
  role="img"
  aria-label={`Rechtsanwalt ${lawyerName}`}
  onContextMenu={(e) => e.preventDefault()}
  onDragStart={(e) => e.preventDefault()}
  draggable={false}
  className="w-32 h-32 rounded-full shadow-lg bg-center bg-cover select-none"
  style={{
    backgroundImage: `url("${lawyerPhotoUrl}")`,
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  }}
/>
```

## Hinweis zu den Grenzen

Das Bild ist weiterhin im Browser-Network-Tab und im Cache als Datei einsehbar — ein 100%iger Schutz ist im Web nicht möglich. Die Änderung blockiert aber alle "üblichen" User-Aktionen (Rechtsklick speichern, Drag & Drop, langer Tap auf Mobile, direktes Sehen als `<img>`-Element im Inspector).

## Betroffene Datei

- `src/components/LawyerContactCard.tsx` (5 Zeilen ersetzt)
