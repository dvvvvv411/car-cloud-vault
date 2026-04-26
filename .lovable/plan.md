## 1. Disclaimer-Text ersetzen

In `src/components/admin/EmailSignaturePreview.tsx` den aktuellen Disclaimer-Satz austauschen gegen die in deutschen Kanzleien gängigere Standard-Vertraulichkeitsklausel:

> Diese E-Mail und etwaige Anhänge enthalten vertrauliche und/oder rechtlich geschützte Informationen. Sollten Sie nicht der richtige Adressat sein oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und löschen Sie diese E-Mail. Das unbefugte Kopieren, Weitergeben oder Verwenden dieser E-Mail ist nicht gestattet.

## 2. Neue Card: Live HTML Editor

Unter der bestehenden Signatur-Card im Tab "Email Signatur" eine zweite Card hinzufügen mit einem **Live-HTML-Editor**:

- **Layout:** zwei Spalten (auf Mobile gestapelt)
  - links: `<Textarea>` (monospaced, ~480px hoch) — Eingabe von HTML
  - rechts: weißer Vorschau-Container, rendert das HTML live via `dangerouslySetInnerHTML`
- **State:** `useState` für den HTML-Code, jede Eingabe aktualisiert sofort die Vorschau (kein "Apply"-Button nötig)
- **Vorbefüllung:** leerer String oder ein kurzes Beispiel-Snippet
- **Buttons in der Card-Header:**
  - "Leeren" (setzt State auf leer)
  - "Aus Signatur laden" (kopiert die generierte Signatur in den Editor — praktisch zum Anpassen)

### Implementierung

In `EmailSignaturePreview.tsx` wird unterhalb der bestehenden `<Card>` eine zweite Komponente gerendert. Da beide thematisch zusammengehören und im selben Tab stehen, kann die zweite Card direkt in derselben Datei als interne Komponente `LiveHtmlEditor` ergänzt werden, oder als kleine Wrapper-Anpassung am Tab-Inhalt.

Vorgehen:
- `EmailSignaturePreview.tsx` exportiert weiterhin `EmailSignaturePreview` als Haupt-Card.
- Zusätzlich wird eine neue Komponente `LiveHtmlEditor` im selben File definiert und ebenfalls exportiert.
- In `src/pages/admin/AdminEmails.tsx` werden im `<TabsContent value="signature">` nun beide Komponenten untereinander gerendert (mit `space-y-6`).
- Alternativ kann `EmailSignaturePreview` selbst beide Cards umschließen — sauberer für die Tab-Datei. Ich gehe diesen Weg: `EmailSignaturePreview` rendert ein Fragment mit beiden Cards und `space-y-6`.

## Geänderte Dateien

- **edit:** `src/components/admin/EmailSignaturePreview.tsx`
  - Disclaimer ersetzen
  - Neue interne Komponente `LiveHtmlEditor` (Card mit Textarea links + Live-Preview rechts)
  - `EmailSignaturePreview` umbauen: rendert beide Cards in einem `<div className="space-y-6">`
- Keine weiteren Dateiänderungen nötig (AdminEmails.tsx bleibt wie ist).
