# CHÂTEAU GRAND V5.8 — FRONTFASSADE

Spielbares Château-Projekt für GitHub Pages / iPhone Safari auf Basis der V5.7. **In diesem Schritt wurde nur die Frontarchitektur überarbeitet.** Die übrigen Bereiche warten auf spätere, einzelne Konstruktionsschritte.

## Installieren

Das ZIP enthält **keinen zusätzlichen Oberordner**. Archiv entpacken; `index.html`, `src/`, `assets/`, `models/`, `docs/` und die Textdateien **direkt** im Stammverzeichnis deines bestehenden GitHub-Repositories `Chateau-Grand-2027` ablegen. Vorhandene gleichnamige Dateien ersetzen. In Working Copy Commit → Push. Unter GitHub Settings → Pages den Branch `main`, Ordner `/ (root)` nutzen.

Nach dem Deploy die vorhandene GitHub-Pages-Adresse mit `?v=58` laden. In der oberen rechten Ecke muss **GRAND CHÂTEAU · V5.8** stehen. Nicht in einen zusätzlichen Unterordner kopieren.

## Ausschließlich die Front wurde neu konstruiert

- Einheitlicher, spiegelgleicher 110-m-Fassadenplan mit zehn äußeren Fensterachsen in allen drei Vollgeschossen.
- Die Wandöffnungen und die sichtbaren Fensterrahmen verwenden exakt dieselben Achsen und Breiten; keine unabhängigen Dekorationsfenster mehr.
- Drei mittige, zweiflügelige Eingangstüren sitzen auf der Terrasse in **schwellenfreien Wandöffnungen**, statt in geschlossenen 70-cm-Brüstungen.
- Sechs klassisch proportionierte Säulen mit Basen, Kapitellen und abgestimmtem Gebälk.
- Dreiecksgiebel mit definierter Tiefe und verbundenen Giebelkanten; die zuvor doppelt montierten Fassadenverzierungen auf der Front wurden entfernt.
- Kontinuierliches Hauptgesims über den Frontachsen, Steinlaibungen, Sohlbänke, Fensterunterteilungen sowie ein sechsfach abgestuftes Zugangsprofil.

Die Seitentrakte, die restliche Dachlandschaft, die Kuppel, Hofseite und Räume wurden absichtlich nicht neu konstruiert. Die hohen Qualitätsziele für das Gesamtgebäude sind noch nicht erreicht.

## Dateien

- `index.html` — Einstieg der Browser-Spielversion
- `src/architecture.js` — **aktive Geometrie** einschließlich der überarbeiteten Front
- `src/app.js` — Renderer/Kamera/Steuerung der bisherigen Version
- `src/style.css` — unverändertes Interface
- `assets/materials/` — alle 14 zuvor enthaltenen Bildmaterialien
- `models/Chateau-Grand-V5.8-Frontfassade.glb` — unabhängiger, **neu erzeugter Export der gesamten mobilen Geometrie**, nicht nur der Front
- `docs/FRONT-KONSTRUKTION.json` — verbindliche Fenster- und Säulenachsen
- `docs/TECHNIK-V5.8.json` — Geometrietest

**Validierung:** Geometrie wurde aus dem tatsächlichen Architektur-JavaScript erzeugt, auf endliche Koordinaten geprüft und als GLB wieder eingelesen. 138.575 Dreiecke in der mobilen Standardeinstellung; 270 Raum-Zoneneinträge (keine fertig eingerichteten Zimmer). Die beigefügten separaten Kontrollansichten sind keine Safari-Spiel-Screenshots. WebGL auf dem echten iPhone noch zu überprüfen.

**Lizenzhinweis:** Die Bildmaterialien stammen aus der früher bereitgestellten Projektdatei. Vor kommerzieller Veröffentlichung die Nutzungsrechte überprüfen.
