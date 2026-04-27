## Ziel
Die Root-Route `/` soll sofort und ohne Verzögerung weiterleiten zu:
`https://insolvenz.anwaelte-neiseke-hagedorn.de/insolvenz/h_s_immobilien_und_kfz_handels_gmbh`

## Aktueller Zustand
In `index.html` gibt es bereits ein synchrones Script, das `/` zu `https://anwaelte-neiseke-hagedorn.de` weiterleitet.

## Änderung
In `index.html` das Redirect-Ziel im Inline-Script anpassen:

```js
if (pathname === '/' || pathname === '') {
  window.location.replace('https://insolvenz.anwaelte-neiseke-hagedorn.de/insolvenz/h_s_immobilien_und_kfz_handels_gmbh');
  return;
}
```

Da das Script synchron im `<head>` läuft, bevor React lädt, erfolgt die Weiterleitung sofort und ohne sichtbare Verzögerung oder Flicker.

## Datei
- `index.html` (eine Zeile im bestehenden Inline-Script)
