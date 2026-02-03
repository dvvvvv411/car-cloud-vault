

## Plan: Vite für alle Domains öffnen

### Änderung in `vite.config.ts`

Statt einzelne Domains aufzulisten, wird `allowedHosts: true` gesetzt. Das erlaubt **alle Hosts** ohne Einschränkung.

**Vorher (Zeilen 10-31):**
```typescript
server: {
  host: "::",
  port: 8080,
  allowedHosts: [
    "insolvenz.solle-schniebel.de",
    "insolvenz.anwaelte-neiseke-hagedorn.de",
    // ... viele weitere Domains
  ]
}
```

**Nachher:**
```typescript
server: {
  host: "::",
  port: 8080,
  allowedHosts: true
}
```

### Ergebnis

| Vorher | Nachher |
|--------|---------|
| Nur gelistete Domains erlaubt | Alle Domains erlaubt |
| Neue Domains müssen manuell hinzugefügt werden | Keine Pflege mehr nötig |
| "Blocked request" Fehler möglich | Kein "Blocked request" mehr |

