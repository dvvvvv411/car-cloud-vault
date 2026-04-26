# Admin-Panel modernisieren — rein visuell, ohne Funktionsänderungen

Ziel: Dem `/admin`-Bereich einen frischeren, moderneren Look geben. **Keine** Inhalte, Felder, Spalten, Buttons oder Logik werden entfernt oder umgebaut. Es geht nur um Optik / Polish.

## Was sich ändert

### 1. AdminLayout (`src/pages/admin/AdminLayout.tsx`)
- **Sidebar**: Leichter Glass-Effekt, dezenter Verlauf, größerer Abstand, runderes Logo-Header mit kleinem Icon-Badge neben „Admin Panel"
- **Aktiver Nav-Eintrag**: Linke Akzentleiste (3px) + sanftere `bg-primary/8` statt nur `bg-primary/10`, kleines Scale-Hover
- **Hover-States**: Smoothere Transition, Icon bekommt subtilen Color-Shift
- **Footer (User + Buttons)**: Feinere Trennung, bessere Typo, Buttons mit `rounded-xl` und subtilen Schatten
- **Header-Bar**: Höher gewichteter Schatten, Breadcrumb-artiger Page-Title-Slot (rein deko, leer wenn nichts gesetzt), User-Avatar-Initiale als Kreis rechts
- **Hintergrund** des Main-Bereichs: Sehr dezenter Radial-Gradient + leichtes Grid-Pattern (über Tailwind utility), damit es nicht so flach wirkt

### 2. Design-Tokens (`src/index.css`)
- Neuer Schatten-Token `--shadow-elegant` und `--shadow-card`
- Neue Gradient-Tokens `--gradient-subtle`, `--gradient-card`
- Neue Utility-Klassen: `.admin-card` (refined Card-Look mit Border + Hover-Lift), `.admin-section-title`, `.admin-bg-pattern`
- Bestehende `--primary`, `--background` etc. bleiben **unverändert**

### 3. Tailwind-Config (`tailwind.config.ts`)
- Animation-Keyframes ergänzen (`slide-in-left`, `scale-in`) für Sidebar/Cards
- Boxshadow-Erweiterung um die neuen Tokens
- **Keine** bestehenden Farben überschrieben

### 4. AdminDashboard (`src/pages/admin/AdminDashboard.tsx`) — nur Cards/Layout
- Stat-Cards: Größere Zahl, Icon in farbigem Soft-Badge oben rechts, dezenter Verlauf-Hintergrund pro Karte (Akzentfarbe sehr leicht), `rounded-2xl`, Hover lift
- Section-Titel mit kleinem Akzent-Strich davor
- Charts-Container bekommen einheitliche `admin-card`-Optik
- **Keine** Daten, Charts oder Werte werden geändert

### 5. Restliche Admin-Seiten
- Wenden die neue `.admin-card` / Section-Title-Optik **nur dort an, wo aktuell `Card`-Wrapper genutzt werden** — über die bereits vorhandene Card-Komponente (klassen-Update am Wrapper)
- Tabellen erhalten `admin-table`-Klasse für konsistenten Header-Look (verwendet bereits `modern-table`-Pattern aus `index.css`)
- Falls eine Seite kein einheitliches Layout hat, bekommt sie einen Page-Header-Block (Titel + dezenter Subtitle), aber nur falls sie **schon** einen Titel hat — keine Inhalts-Erfindung

## Was definitiv NICHT geändert wird
- Keine Funktionalität, keine Hooks, keine Routen, keine API-Aufrufe
- Keine Felder hinzugefügt/entfernt
- Keine Texte umformuliert (nur Typo/Größe)
- Keine Farbpalette gewechselt — wir bleiben beim aktuellen Blau-Primary

## Dateien

- `src/index.css` — neue Tokens & Utilities
- `tailwind.config.ts` — Animation/Shadow-Erweiterung
- `src/pages/admin/AdminLayout.tsx` — Sidebar/Header/Background Polish
- `src/pages/admin/AdminDashboard.tsx` — Stat-Cards & Section-Polish
- Sanfte Class-Updates in: `AdminAnfragen.tsx`, `AdminBranding.tsx`, `AdminEmails.tsx`, `AdminBenutzer.tsx`, `AdminFahrzeuge.tsx`, `AdminPositionen.tsx`, `AdminLeads.tsx`, `AdminKaltaquise.tsx`, `AdminAmtsgericht.tsx`, `AdminTelegram.tsx` (jeweils nur Wrapper-/Card-Klassen)

Nach Approval setze ich das in einem Rutsch um.
