## Anfragedetails-Popup kompakter gestalten

Ziel: alle bestehenden Infos beibehalten, aber dichter packen, sodass man möglichst viel auf einen Blick sieht – ohne Scrollen für die wichtigsten Sektionen.

### Übergreifende Änderungen

- **Dialog breiter**: `max-w-3xl` → `max-w-5xl`, damit ein 2-Spalten-Layout möglich wird.
- **Padding**: `DialogContent` bekommt `p-5`; vertikaler Abstand `space-y-6` → `space-y-3`.
- **Sektions-Cards** statt großer Überschriften + `Separator`: jede Sektion wird zu einer kleinen Card (`rounded-lg border bg-card/50 p-3`) mit Mini-Header (Icon + 11px uppercase Label). Die `<Separator>`-Trenner entfallen komplett.
- **Typografie kleiner & dichter**: Body `text-xs`, Labels `text-[10px] uppercase tracking-wide text-muted-foreground`, Werte `text-sm font-medium`. Wert direkt rechts neben dem Label (Inline-Pair) statt darunter → halbiert Höhe.
- **Status, Erstellt, Branding & Rabatt-Button** wandern in eine schlanke **Toolbar direkt unter dem DialogTitle** (immer sichtbar, ohne eigene Sektion).

### Neues Layout (1819px Viewport)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Anfragedetails                                                          [X] │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ● Neu ▾   📅 24.04.2026 14:32   🏢 Müller GmbH · AZ 12-345   [Rabatt]   │ │  ← Toolbar
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─ KUNDE ──────────────[edit][view]─┐ ┌─ FAHRZEUGE  3 · 12.450 €  [edit][🔢]┐│
│ │ Typ      Geschäftskunde           │ │ ▸ BMW 320d · DEKRA 1234 · 89.000 km││
│ │ Firma    Müller GmbH              │ │ ▸ Audi A4  · DEKRA 1235 · 102.000  ││
│ │ Name     Max Mustermann           │ │ ▸ VW Golf  · DEKRA 1236 · 65.000   ││
│ │ E-Mail   max@example.com          │ │   [Details ▾ aufklappen]           ││
│ │ Telefon  +49 170 1234567          │ │                                     ││
│ │ Adresse  Musterstr. 1, 10115 BLN  │ │                                     ││
│ └────────────────────────────────────┘ └─────────────────────────────────────┘│
│                                                                              │
│ ┌─ NACHRICHT ─────────────────────┐ ┌─ GESAMTPREIS ───────────────────────┐ │
│ │ "Bitte um Rückruf bezüglich     │ │  14.815,50 €  inkl. 19% MwSt.       │ │
│ │  Lieferzeitraum…"               │ │  Netto: 12.450 €  · 5% Rabatt       │ │
│ └─────────────────────────────────┘ └─────────────────────────────────────┘ │
│                                                                              │
│ ┌─ NOTIZEN  3  [+ Notiz] ───────────────────────────────────────────────────┐│
│ │ ● max@…  24.04. 14:40   Kunde zurückgerufen, Termin Mo                  ││
│ │ ● eva@…  24.04. 15:10   Angebot per Mail raus                            ││
│ │ ● max@…  25.04. 09:00   …                                                ││
│ │ (ScrollArea h-[140px])                                                    ││
│ └───────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Sektion-Details

**1. Toolbar (neu, ersetzt „Weitere Informationen")**
- Eine Zeile, `flex items-center gap-3 text-xs`, kleiner border-Container.
- Inhalt: `InquiryStatusDropdown` (kompakt) · Erstellt-Datum mit Kalender-Icon · Branding (Firma · AZ-Nummer) als Inline-Chip (nur wenn vorhanden) · rechts: `DiscountButton` + ggf. „Gewährt am …".
- Damit verschwinden die separaten Sektionen „Branding-Informationen" und „Weitere Informationen" – ihre Inhalte sind hier kompakt vereint.

**2. Kundeninformationen (links, ½ Breite)**
- Card mit Mini-Header „KUNDE" + Buttons (`EditCustomerInfoDialog`, `CustomerInfoDialog`) als Icon-Buttons (`size="icon"`, `h-7 w-7`).
- Inhalt als 2-Spalten-Definition-List: Label links (90px, muted, text-[10px] uppercase), Wert rechts (text-sm). Felder unverändert: Typ, Firma (cond.), Name, E-Mail, Telefon, Adresse.

**3. Ausgewählte Fahrzeuge (rechts, ½ Breite)**
- Mini-Header „FAHRZEUGE" + Anzahl- und Preis-Badge inline + Icon-Buttons (`EditInquiryVehiclesDialog`, `DekraNumbersDialog`).
- Standard-Anzeige: kompakte **einzeilige Liste** pro Fahrzeug:
  `● BMW 320d  ·  DEKRA 1234  ·  FIN WBA…  ·  EZ 2018  ·  89.000 km  ·  12.500 € netto`
  → eine Zeile `text-xs`, mit `truncate` und `title=…` für Overflow.
- Bestehender `Collapsible` „Details anzeigen" bleibt darunter und zeigt zusätzlich die volle Detail-Grid (wie heute), für Power-User. Default zu = identisches Verhalten wie jetzt.

**4. Nachricht (links unten, ½ Breite)** – nur wenn vorhanden
- Card, Mini-Header „NACHRICHT", Text `text-xs whitespace-pre-wrap`, `max-h-24 overflow-auto`.

**5. Gesamtpreis (rechts unten, ½ Breite)**
- Card mit Mini-Header „GESAMTPREIS".
- Hauptpreis `text-xl font-bold text-primary` (statt 2xl), darunter eine einzige Meta-Zeile: `inkl. 19% MwSt.  ·  Netto X €  ·  Rabatt 5%` (alles inline mit `·`-Trennern, `text-[11px]`).
- Komplette Berechnungs-Logik (`isFahrzeuge`, `calculateBruttoFromNetto`, `calculateNettoFromBrutto`, Rabatt-Anzeige) bleibt unverändert – nur visuell zusammengefasst.

**6. Notizen (volle Breite)**
- Mini-Header „NOTIZEN" + Count-Badge + `AddNoteButton` (kompakt) inline.
- ScrollArea-Höhe `h-[200px]` → `h-[140px]`.
- Pro Notiz: 1-Zeilen-Header (Farbpunkt + verkürzte E-Mail + Datum kurz `dd.MM. HH:mm`) und Notiz-Text `text-xs`. Padding zwischen Notizen: `pb-2` statt `pb-3`.

### Responsive
- Grid: `grid-cols-1 lg:grid-cols-2 gap-3` für Kunde/Fahrzeuge und Nachricht/Preis.
- Mobile (< lg): Sektionen stapeln untereinander, Toolbar wrappt.

### Was sich NICHT ändert
- Alle gezeigten Datenfelder, alle Buttons/Dialoge (EditCustomerInfoDialog, CustomerInfoDialog, EditInquiryVehiclesDialog, DekraNumbersDialog, AddNoteButton, DiscountButton, InquiryStatusDropdown).
- Preis-Berechnungslogik, Brutto/Netto-Anzeige, Rabatt-Logik.
- Read-only Verhalten, `allowedStatuses`-Weitergabe.
- Trigger-Button („Details") in der Anfragen-Tabelle.

### Datei
- `src/components/admin/InquiryDetailsDialog.tsx` (nur diese Datei wird geändert).
