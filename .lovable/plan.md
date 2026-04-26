## Sidebar-Überarbeitung in `AdminLayout.tsx`

### 1. Animation entfernen
Die `animate-slide-in-left` Klasse plus `animationDelay` werden bei jedem Routen-Wechsel neu abgespielt, weil React die NavLinks neu rendert. Das wirkt wie ein "Neuladen".

- `animate-slide-in-left` und `style={{ animationDelay: ... }}` aus den NavLink-Items entfernen.
- Hover/Active-Transitions (`transition-all duration-200`) bleiben erhalten — fühlt sich smooth an, ohne Re-Mount-Effekt.

### 2. Navigation in Gruppen aufteilen

Statt einer flachen `navItems` Liste mit Label "Navigation" werden drei Abschnitte gerendert:

```text
Dashboard            (kein Gruppen-Label, steht solo oben)

— Betrieb —
  Anfragen
  Amtsgericht
  Kaltaquise
  Leads

— Einstellungen —
  Branding
  Positionen
  Fahrzeuge
  Benutzer
  Preview
  Telegram
```

Umsetzung:
- `navItems` wird in eine Struktur mit Gruppen umgewandelt:
  ```ts
  const navGroups = [
    { label: null, items: [Dashboard] },
    { label: 'Betrieb', items: [Anfragen, Amtsgericht, Kaltaquise, Leads] },
    { label: 'Einstellungen', items: [Branding, Positionen, Fahrzeuge, Benutzer, Preview, Telegram] },
  ];
  ```
- `SidebarNav` rendert pro Gruppe einen `<SidebarGroup>` mit `<SidebarGroupLabel>` (nur wenn `label` gesetzt) und den jeweiligen `<SidebarMenuItem>`.
- Die User-Filter (`isAmtsgerichtOnlyUser`, `isInquiryOnlyUser`, `isKaltaquiseOnlyUser`) werden weiterhin angewandt — leere Gruppen werden ausgeblendet.
- Visuelle Trennung zwischen Gruppen: kleiner vertikaler Abstand (`mt-4` auf nicht-erste Gruppen) plus dezente Gruppen-Labels im bestehenden Stil (`text-[10px] uppercase tracking-[0.12em]`).

### 3. Keine funktionalen Änderungen
- URLs, Icons, Berechtigungen, Redirects, User-Sektion und Header bleiben unverändert.
