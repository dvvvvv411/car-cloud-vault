

## Plan: Domain `frik-maxeiner.de` zur allowedHosts hinzufügen

### Änderung in `vite.config.ts`

Die neue Domain `insolvenz.frik-maxeiner.de` und die Hauptdomain `frik-maxeiner.de` werden zur Liste hinzugefügt:

**Zeile 16-17 erweitern:**

```typescript
allowedHosts: [
  // Insolvenz Subdomains
  "insolvenz.solle-schniebel.de",
  "insolvenz.anwaelte-neiseke-hagedorn.de",
  "insolvenz.merits-partner.de",
  "insolvenz.legati-kanzlei.de",
  "insolvenz.frik-maxeiner.de",  // ← NEU
  
  // Hauptdomains
  "solle-schniebel.de",
  "anwaelte-neiseke-hagedorn.de",
  "merits-partner.de",
  "legati-kanzlei.de",
  "frik-maxeiner.de",  // ← NEU
  
  // Fahrzeuge Domains
  "audi-vertrieb-leipzig.de",
  "www.audi-vertrieb-leipzig.de",
  
  // Development
  ".lovable.app",
  "localhost"
]
```

### Ergebnis

| Domain | Status |
|--------|--------|
| `insolvenz.frik-maxeiner.de` | Erlaubt |
| `frik-maxeiner.de` | Erlaubt |

Nach dieser Änderung wird die "Blocked request"-Meldung nicht mehr erscheinen.

