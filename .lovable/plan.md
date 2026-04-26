## Ziel

Auf `/admin/preview` einen neuen Tab **"Email Signatur"** hinzufügen, der eine fertige HTML-E-Mail-Signatur für Philip Neiseke rendert. Per Button kann zwischen visueller Vorschau und HTML-Quellcode (mit Copy-Button) gewechselt werden.

## Inhalt der Signatur

Daten kommen aus dem Branding `H- S Immobilien und Kfz Handels GmbH`:

- **Name:** Philip Neiseke
- **Kanzlei:** Neiseke & Hagedorn
- **Subtitle:** Rechtsanwälte in Partnerschaft PartG mbB
- **Adresse:** Kanzlerstr. 1, 40472 Düsseldorf
- **Telefon:** 0211 87971650
- **E-Mail:** p.neiseke@anwaelte-neiseke-hagedorn.de
- **Web:** https://anwaelte-neiseke-hagedorn.de
- **Logo:** `neiseke-hagedorn-logo-white.png` (aus dem Projekt `neiseke-hagedorn` kopiert nach `src/assets/`). Da das Original ein weißes Logo ist und Signaturen meist auf weißem Hintergrund stehen, wird es in der Signatur auf einem dezenten dunklen Logo-Block (z. B. Primary-Farbe der Kanzlei `#0f3b5b`-artig dunkelblau) eingebettet — alternativ auf transparentem dunklem Container per `<table>`-Zelle mit `bgcolor`. Falls gewünscht, kann später noch eine dunkle Variante getauscht werden.

## UI / Komponenten

1. **`src/pages/admin/AdminEmails.tsx`**
   - Im bestehenden `<Tabs>` einen neuen `<TabsTrigger value="signature">Email Signatur</TabsTrigger>` ergänzen.
   - Neuen `<TabsContent value="signature">` mit `<EmailSignaturePreview />` rendern.

2. **Neue Komponente `src/components/admin/EmailSignaturePreview.tsx`**
   - State: `view: 'preview' | 'code'`.
   - Card mit Header "E-Mail Signatur – Philip Neiseke".
   - Zwei Buttons: **Vorschau** / **HTML Code** (Toggle, gleicher Stil wie im `AdminEmailSignatureDialog`).
   - Im Preview-Modus: weißer Container, Signatur via `dangerouslySetInnerHTML`.
   - Im Code-Modus: read-only `<Textarea>` mit dem HTML + **"In Zwischenablage kopieren"**-Button (Lucide `Copy` Icon, `navigator.clipboard.writeText`, toast).
   - Konstante `SIGNATURE_HTML` am Dateianfang — Tabellen-basierter HTML-Block (E-Mail-kompatibel), enthält:
     - 1 Spalte Logo (Bild aus `src/assets/neiseke-hagedorn-logo-white.png`, importiert und im HTML als absolute URL via `window.location.origin + buildSrc` eingebettet — siehe technische Hinweise).
     - 1 Spalte Kontaktdaten mit den oben gelisteten Feldern, Trennlinie, kleinem Disclaimer.

3. **Asset-Übernahme**
   - `src/assets/neiseke-hagedorn-logo-white.png` per `cross_project--copy_project_asset` aus dem Projekt `neiseke-hagedorn` in dieses Projekt kopieren.

## Technische Hinweise

- Logo via `import logo from '@/assets/neiseke-hagedorn-logo-white.png'` einbinden; im sichtbaren Preview wird das Vite-URL benutzt. Im exportierbaren HTML-Code wird zusätzlich eine **vollständige URL** (basierend auf `window.location.origin + logo`) gerendert, damit der kopierte Code in einem externen E-Mail-Client funktioniert. Zusätzlicher Hinweistext unter dem Code: "Für den produktiven Einsatz das Logo auf einer dauerhaften, öffentlich erreichbaren URL hosten."
- HTML benutzt `<table>` mit Inline-CSS (E-Mail-Standard) — keine modernen Layout-Features.
- Kein DB-Schema-Change, keine Edge Function nötig.

## Geänderte / neue Dateien

- **neu:** `src/components/admin/EmailSignaturePreview.tsx`
- **neu:** `src/assets/neiseke-hagedorn-logo-white.png` (aus anderem Projekt kopiert)
- **edit:** `src/pages/admin/AdminEmails.tsx` (neuen Tab einhängen)
