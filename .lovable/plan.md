## Korrekturen am Insolvenz-Bestätigungsemail

### 1. Fahrzeuge wieder als Tabelle (statt Cards)
Datei: `supabase/functions/send-inquiry-confirmation/_templates/inquiry-confirmation.tsx`

Cards-Darstellung entfernen und durch klassische, aber modern gestaltete Tabelle ersetzen:
- Spalten: **Marke**, **Modell**, **Preis (netto)**
- Header dezent mit Untergrund `#f8fafc`, Uppercase-Label, kleiner Schrift, Akzent-Unterlinie
- Zellen mit dezenter Trennlinie `#e2e8f0`, ausreichend Padding
- Bei mehreren Fahrzeugen Tabellen-Footer mit "Gesamtsumme (netto)" + Betrag (statt schwarzer Box)
- Bei nur einem Fahrzeug kein Footer (redundant)

### 2. Gesamtsumme-Sichtbarkeit korrigieren
Die Gesamtsumme stand zuvor in dunkler Box `#1a202c` mit `color: accent` — bei dunklen Akzentfarben unsichtbar.

Neu: Tabellen-Footer mit hellem Hintergrund (`#f8fafc`), Akzentfarbe für den Betrag bleibt, aber kontrastiert sicher. Zusätzlich Fett-Schrift.

### 3. Footer kompakt (1–2 Zeilen)
Statt mehrerer untereinanderliegender `Text`-Blöcke (Firma, Subtitle, Adresse, Telefon, E-Mail, Web) den Footer auf maximal 1–2 Zeilen verdichten:

Format:
```
{lawyer_firm_name} · {lawyer_address_street}, {lawyer_address_city}
Tel: {lawyer_phone} · {lawyer_email} · {lawyer_website_url}
```

Mit `·` als Trenner, kleinere Schriftgröße (12–13px), graue Sekundärfarbe, mittig ausgerichtet. Subtitle (falls vorhanden) wird in Klammern an die Firmenzeile angehängt oder weggelassen, um die 2-Zeilen-Vorgabe einzuhalten.

### 4. Preview synchronisieren + Deploy
- `supabase/functions/preview-inquiry-confirmation/_templates/inquiry-confirmation.tsx` identisch überschreiben
- Beide Edge Functions neu deployen
