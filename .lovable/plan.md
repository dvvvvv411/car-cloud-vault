## Footer- und Tabellen-Korrekturen

### 1. Kanzleiname vollständig im Footer
`branding.lawyer_firm_subtitle` (zweiter Teil des Kanzleinamens) wird wieder mit ausgegeben — direkt nach `lawyer_firm_name` mit Bindestrich/Spatium getrennt:

```
{lawyer_firm_name} {lawyer_firm_subtitle} · {street}, {city}
```

### 2. E-Mail im Footer hardcoded info@<domain>
Statt `branding.lawyer_email` wird die E-Mail dynamisch aus `branding.lawyer_website_url` abgeleitet:
- Domain aus URL extrahieren (`https://www.kanzlei.de` → `kanzlei.de`, `www.` strippen)
- Anzeige + mailto: `info@<domain>`
- Fallback: wenn keine Website-URL vorhanden, weiterhin `branding.lawyer_email`

### 3. "Gesamtsumme (netto)" links ausrichten
In der Tabellen-`tfoot` das Label `tfootLabel` von `textAlign: 'right'` auf `textAlign: 'left'` ändern. Der Betrag selbst (`tfootTotal`) bleibt rechtsbündig.

### 4. Preview synchronisieren + Deploy
Datei `preview-inquiry-confirmation/_templates/inquiry-confirmation.tsx` identisch überschreiben, beide Functions deployen.
