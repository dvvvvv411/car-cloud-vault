## Signatur-Feinschliff

Anpassungen in `src/components/admin/EmailSignaturePreview.tsx` (Funktion `buildSignatureHtml`):

1. **Goldener Divider breiter**: `width: 180px` → `width: 280px` (Höhe und Farbe `#c9a961` bleiben).
2. **Kontaktblock vereinheitlichen** mit dem Style des Kanzleinamens „Neiseke & Hagedorn Rechtsanwälte in Partnerschaft PartG mbB":
   - Innere Tabelle: `font-size: 13px; color: #1f2a44;` → `font-size: 12px; color: #4b5563;`
   - Link-Farben (Tel / E-Mail / Web): `color:#0a1f3d` → `color:#4b5563` (gleicher Grauton wie umgebender Text, `text-decoration:none` bleibt)

Änderungen wirken automatisch in Vorschau, HTML-Code und „Aus Signatur laden".

**Geänderte Datei:**
- `src/components/admin/EmailSignaturePreview.tsx`
