## Favicon austauschen

### Schritte

1. `user-uploads://icon.png` nach `public/favicon.png` kopieren (überschreibt das bestehende Favicon).
2. Sicherstellen, dass kein altes `public/favicon.ico` mehr existiert (löschen falls vorhanden), damit Browser nicht die Default-Datei laden.
3. `index.html` prüfen — der Link `<link rel="icon" href="/favicon.png" type="image/png">` zeigt bereits auf die korrekte Datei, keine Änderung nötig.
4. Das Fahrzeuge-Favicon (`/favicon-fahrzeuge.png`) bleibt unverändert, da es nur für `/fahrzeuge`-Routen genutzt wird.

### Dateien

| Datei | Aktion |
|-------|--------|
| `public/favicon.png` | Mit neuem Icon überschreiben |
| `public/favicon.ico` | Löschen (falls vorhanden) |
