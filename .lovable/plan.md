## Ziel

Das Insolvenz-Bestätigungsemail (`send-inquiry-confirmation`) komplett modernisieren, dynamische Singular/Plural-Texte einbauen, Netto-Kennzeichnung beim Preis, neuer Betreff mit Anwaltskanzlei statt insolventem Unternehmen, und Preview entsprechend aktualisieren.

## Änderungen

### 1. Email-Template modernisieren
Datei: `supabase/functions/send-inquiry-confirmation/_templates/inquiry-confirmation.tsx`

Neues, modernes Design:
- Sauberer Header-Bereich mit Logo zentriert + dezente Akzentfarbe (aus `branding.primary_color` falls vorhanden, sonst Standard `#1a365d`)
- Großzügige Whitespaces, weichere Card-Optik (subtile Schatten via `border` statt `box-shadow` für Email-Kompatibilität)
- Moderne Sans-Serif-Font-Stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial`)
- Farbpalette: Hintergrund `#f4f6f8`, Card `#ffffff`, Text `#1a202c`, Sekundärtext `#4a5568`, Akzent aus Branding
- Status-Badge "Anfrage eingegangen" oben
- Fahrzeug-Darstellung als Cards (statt klassischer Tabelle), pro Fahrzeug ein abgesetzter Block mit Marke + Modell groß und Preis rechts
- Preis-Block mit deutlichem Hinweis **"Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt."** unter der Gesamtsumme
- "Nächste Schritte"-Sektion mit nummerierten Punkten
- Footer modernisiert mit klarer Trennung Kontakt / Kanzlei

Dynamische Texte (Singular vs. Plural) basierend auf `vehicles.length`:
- Preview-Text: "folgendes Fahrzeug" / "folgende Fahrzeuge"
- Hauptsatz: "wir haben Ihre Anfrage zu folgendem Fahrzeug erhalten:" / "... zu folgenden Fahrzeugen erhalten:"
- Überschrift Fahrzeugblock: "Ihr angefragtes Fahrzeug" / "Ihre angefragten Fahrzeuge"
- Gesamtsumme nur anzeigen, wenn mehr als 1 Fahrzeug (bei Einzelfahrzeug entfällt sie, da redundant)

### 2. Email-Betreff ändern
Datei: `supabase/functions/send-inquiry-confirmation/index.ts`

Aktuell:
```
Bestätigung Ihrer Anfrage - {branding.company_name}
```
Neu:
```
Bestätigung Ihrer Fahrzeuganfrage - {branding.lawyer_firm_name}
```
(Anwaltskanzlei statt insolventem Unternehmen)

### 3. Preview-Synchronisierung
Datei: `supabase/functions/preview-inquiry-confirmation/_templates/inquiry-confirmation.tsx`

Identisch zu (1) überschreiben, damit Preview unter `/admin/emails` → "Anfrage-Bestätigung (Vorschau)" exakt das neue Design zeigt.

Zusätzlich in `supabase/functions/preview-inquiry-confirmation/index.ts` prüfen, ob der Betreff im Preview-Header mit angezeigt wird – falls ja, ebenfalls auf neuen Betreff umstellen, damit die Vorschau realistisch ist.

### 4. Edge Functions deployen
Beide Functions neu deployen:
- `send-inquiry-confirmation`
- `preview-inquiry-confirmation`

## Nicht betroffen
- Fahrzeuge-System-Email (`send-fahrzeuge-inquiry-confirmation`) bleibt unverändert (separates System gemäß Architektur).
- Datenstruktur, RLS, andere Templates bleiben unverändert.
