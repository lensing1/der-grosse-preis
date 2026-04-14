# Großer Preis – PWA Basis

Diese Basis ist für GitHub Pages und Offline-Nutzung per PWA vorbereitet.

## Dateien
- `index.html` – Grundstruktur
- `theme.css` – Styling
- `app.js` – Logik
- `game-data.json` – Kategorien und Punkte
- `manifest.json` – PWA-Metadaten
- `service-worker.js` – Offline-Cache

## Inhalte ändern
Passe `game-data.json` an:

```json
{
  "categories": [
    { "name": "DDR", "points": [25, 50, 75, 100] },
    { "name": "Sport", "points": [25, 50, 75, 100] }
  ]
}
```

## Lokal testen
Nutze einen kleinen lokalen Server, z. B.:

```bash
python3 -m http.server 8000
```

Dann im Browser öffnen:

```text
http://localhost:8000
```

## GitHub Pages
Lege alle Dateien ins Repo und aktiviere GitHub Pages.
"# der-grosse-preis" 
