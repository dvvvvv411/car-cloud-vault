# Problem

In der Vorschau (`/admin/preview` → "Anfrage-Bestätigung Email") hat die weiße Karte einen schönen Innenabstand (40px oben/unten, 36px links/rechts) — der Inhalt liegt komfortabel von der Border entfernt.

In der **tatsächlich versendeten E-Mail** (Gmail, Outlook etc.) klebt der Inhalt jedoch direkt an der Border.

**Ursache:** Die Karte ist als `<Section style={card}>` umgesetzt. React Email rendert `<Section>` als `<table>`. Gmail (und einige andere Clients) **ignorieren CSS-`padding` auf `<table>`-Elementen** — Padding muss zwingend auf das innere `<td>` gesetzt werden. In der iframe-Vorschau funktioniert es, weil Browser das table-padding respektieren.

Betroffen sind beide Templates (identische Dateien):
- `supabase/functions/send-inquiry-confirmation/_templates/inquiry-confirmation.tsx`
- `supabase/functions/preview-inquiry-confirmation/_templates/inquiry-confirmation.tsx`

# Lösung

Den Karten-Wrapper so umbauen, dass das Padding auf einer **inneren Tabellenzelle** sitzt und die Border/Background/Border-Radius auf der äußeren Tabelle bleibt. Damit funktioniert der Innenabstand zuverlässig in allen E-Mail-Clients.

Konkret in beiden Template-Dateien:

1. Die Karte wird statt `<Section style={card}>` als explizite Tabelle gerendert:
   ```tsx
   <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={cardTable}>
     <tbody>
       <tr>
         <td style={cardCell}>
           {/* gesamter bisheriger Karten-Inhalt */}
         </td>
       </tr>
     </tbody>
   </table>
   ```
2. Style-Objekte anpassen:
   - `cardTable`: `backgroundColor`, `border: '1px solid #e2e8f0'`, `borderRadius: '12px'`, `borderCollapse: 'separate'` (wichtig, damit `border-radius` greift), `width: '100%'`.
   - `cardCell`: `padding: '40px 36px'` (für mobile Clients zusätzlich responsive Anpassung möglich, aber nicht zwingend).
3. `outerContainer` bleibt unverändert (sorgt weiter für den 16px-Außenabstand zum Bildschirmrand).

Beide Dateien (preview + send) müssen identisch geändert werden, damit Vorschau und tatsächlicher Versand übereinstimmen.

# Deployment

Nach den Code-Änderungen die Edge Function `send-inquiry-confirmation` neu deployen, damit der Versand die neue Version verwendet. (`preview-inquiry-confirmation` wird ebenfalls neu deployed, ist aber visuell schon vorher korrekt.)

# Verifikation

- Vorschau im Admin sollte unverändert aussehen (Innenabstand bleibt 40/36px).
- Eine echte Test-Anfrage absenden und die zugestellte Mail in Gmail prüfen — der Inhalt soll deutlichen Abstand zur grauen Border haben.
