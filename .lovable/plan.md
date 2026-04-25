## Sofortige Weiterleitung der Landingpage

### Was wird geaendert

Die Root-Route `/` soll ohne jede Verzoegerung (kein Loading-Spinner, kein React-Bootstrap, keine Datenbankabfrage) zu `https://anwaelte-neiseke-hagedorn.de` weiterleiten — auf allen Domains.

Aktuell laeuft der Redirect ueber die React-Komponente `DomainBasedRedirect`, die zuerst die Brandings aus Supabase laedt. Das verursacht die sichtbare Verzoegerung mit Spinner.

### Technische Umsetzung

Eine einzige Aenderung in `index.html` im bereits vorhandenen Inline-Script:

Im `domainRedirects`-Block wird ein generischer Fallback hinzugefuegt, der bei `pathname === '/'` immer (unabhaengig vom Hostname) sofort weiterleitet — noch bevor React geladen wird.

```js
if (pathname === '/' || pathname === '') {
  window.location.replace('https://anwaelte-neiseke-hagedorn.de');
  return;
}
```

Das bestehende `domainRedirects`-Mapping (Audi) wird dadurch obsolet, weil der neue Redirect alle Domains abdeckt — es wird entfernt, um Doppel-Logik zu vermeiden.

Die React-Route `<Route path="/" element={<DomainBasedRedirect ... />} />` bleibt als Fallback bestehen, wird in der Praxis aber nie erreicht, da der Browser schon vor dem React-Mount weiterleitet.

Andere Routen (`/insolvenz`, `/fahrzeuge`, `/admin`, ...) bleiben unveraendert.

### Dateien

| Datei | Aenderung |
|-------|-----------|
| `index.html` | Inline-Script: unbedingter `window.location.replace` fuer `/` zu `https://anwaelte-neiseke-hagedorn.de` |
