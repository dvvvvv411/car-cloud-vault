## Email Signatur überarbeiten

Anpassungen an `src/components/admin/EmailSignaturePreview.tsx` in der Funktion `buildSignatureHtml`:

**Neue Reihenfolge der Signatur (von oben nach unten):**

1. **Grußformel**: "Mit freundlichen Grüßen," (kursiv/normal, etwas Abstand nach unten)
2. **Name**: "Philip Neiseke" (fett, 16px, dunkles Marineblau `#0a1f3d`)
3. **Untertitel**: "Rechtsanwalt" (12px, grau `#4b5563`)
4. **Goldener Divider**: horizontale Linie (1-2px, ~180px breit) in der gleichen Goldfarbe wie das `&` im Logo (geschätzt `#c9a961` / warmes Gold — wird beim Build per Auge anhand des Logos verifiziert und ggf. auf den exakten Hex-Wert angepasst)
5. **Logo**: `neiseke-hagedorn-logo.png` (Breite 200px, Block-Element, leichter Top-Padding)
6. **Kanzleiname**: "Neiseke & Hagedorn Rechtsanwälte in Partnerschaft PartG mbB" (12px, grau `#4b5563`, gleicher Style wie "Rechtsanwalt")
7. **Adresse**: "Kanzlerstr. 1, 40472 Düsseldorf"
8. **Kontaktblock**: Tel / E-Mail / Web (unverändert, dunkles Marineblau für Links)
9. **Disclaimer**: unverändert

**ASCII-Skizze der neuen Struktur:**

```text
Mit freundlichen Grüßen,

Philip Neiseke
Rechtsanwalt
━━━━━━━━━━━━━━━━━━  (gold)
[ Logo Neiseke & Hagedorn ]
Neiseke & Hagedorn Rechtsanwälte in Partnerschaft PartG mbB
Kanzlerstr. 1, 40472 Düsseldorf
Tel: 0211 87971650
E-Mail: p.neiseke@anwaelte-neiseke-hagedorn.de
Web: anwaelte-neiseke-hagedorn.de
─────────────────────
Diese E-Mail und etwaige Anhänge…
```

**Technische Details:**

- Tabelle bleibt als Layout-Container (E-Mail-kompatibel).
- Goldener Divider als `<div style="width:180px; height:2px; background:#c9a961; margin:6px 0 12px 0;"></div>` (Hex-Wert wird beim Editieren am tatsächlichen Logo abgeglichen).
- Logo-Breite von 220px → 200px reduzieren, damit es unter dem Divider proportional sitzt.
- "Mit freundlichen Grüßen," in eigener `<tr>` mit `padding-bottom: 14px`.
- `previewHtml` und `exportHtml` in `SignatureCard` nutzen weiterhin dieselbe `buildSignatureHtml`-Funktion → Änderung wirkt automatisch in Vorschau, HTML-Code und „Aus Signatur laden" im Live-Editor.

**Geänderte Datei:**
- `src/components/admin/EmailSignaturePreview.tsx`
