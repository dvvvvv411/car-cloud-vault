## Änderungen an der E-Mail-Signatur

**Logo austauschen:**
- Neues Logo `src/assets/neiseke-hagedorn-logo.png` (vom User hochgeladen, dunkler Schriftzug auf transparent) verwenden statt der weißen Version auf blauem Block.
- Kein Hintergrund-Block mehr — Logo steht direkt auf weißem Mail-Hintergrund.
- Breite ca. 220px, dezent über den Kontaktdaten platziert.

**Farben anpassen:**
- Texte und Links auf dunkleres Marine-Blau `#0a1f3d` umstellen (statt vorherigem `#0f3b5b`).
- Sekundärtext bleibt grau (`#4b5563`, `#9ca3af`).

**Layout vereinfachen:**
- Zwei-Spalten-Layout (Logo-Block links / Text rechts) entfernt.
- Stattdessen: Logo oben, Kontaktdaten direkt darunter — schlichter und deutlich dezenter.
- Subtitle kompakter in einer Zeile mit Rechtsanwalt-Bezeichnung.

## Geänderte Dateien

- **neu:** `src/assets/neiseke-hagedorn-logo.png` (aus Upload)
- **edit:** `src/components/admin/EmailSignaturePreview.tsx` — `buildSignatureHtml` und Import anpassen
- **delete optional:** `src/assets/neiseke-hagedorn-logo-white.png` (nicht mehr verwendet)
