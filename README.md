# CHÂTEAU GRAND 2027 — MAXGAME-PALAST V2.1

## Aktueller Arbeitsschritt: ausschließlich der monumentale Eingang

Diese Version entwickelt das **laufende, vollständig mit Three.js und MaxGame-Materialien erzeugte Palastprojekt 2.0** weiter. Es ist **keine Grafik-Vorschau**, kein neues Spiel von null und keine Fotomontage. Die übrigen vier Schlossflügel, die Kuppel-/Dachlandschaft, der Innenhof, das Terrain und das originale MaxGame bleiben erhalten.

### Neue Konstruktion

1. **Freie Eingangsöffnungen:** Drei 3,05 m breite Holz-Doppeltüren stehen nun auf den Achsen **−16,28 m, 0 m, +16,28 m**. Die Türöffnung wird wirklich aus den Fassaden-Wandsegmenten herausgelassen. Vor den Türen steht keine Säule mehr.
2. **Original-MaxGame-Säulen:** 12 echte geometrisch profilierte Säulen bleiben erhalten. Die Säulen sind im Querschnitt jetzt **rund** statt durch unterschiedliche X-/Z-Skalierung oval. Die Achsen stehen vorne und hinten bei −20,35, −12,21, −4,07, +4,07, +12,21, +20,35 m. Die schmalste freie Distanz zwischen **Türlaibung und Säulensockel beträgt 1,06 m**.
3. **26 Einzelstufen:** 26 profilierte, dünne Natursteinstufen mit **17,3 cm Steigung**, 80 cm Auftritt und sanft verbreitertem Grundriss anstelle hoher Vollquader. Der Gesamthöhenunterschied beträgt weiterhin 4,5 m, damit der Eingang an die vorhandene Geschossebene anschließt.
4. **Abgeschrägte, zurückgesetzte Treppenstütze:** Kein senkrechter massiver Treppenblock mehr entlang beider Stufenseiten. Die Seiten bestehen aus einer schräg geführten Stütze und schlanken Steinkanten.
5. **Podium:** Die doppelten großen Treppen-/Podiumblöcke aus dem Spender-GLB (`Cube433`–`Cube438`) werden nicht mehr eingebaut. Das obere Podium besitzt jetzt eine sichtbare 30 cm starke Platte mit schmalem Sims und darunter ein zurückspringendes Mauerwerk, eingefasst von dezenten Blindnischen und einer Steinbalustrade.
6. **Drei hölzerne Doppeltüren:** Nussbaum-Füllungen, separate Türblätter und Messingbeschläge statt dunkelgrauer Platzhalter. Vier Wandleuchten und ein Wappenmedaillon ergänzen ausschließlich den Eingangsbereich.
7. **Neue Kameraansichten:** Mit **„Eingang“** und **„Treppe Seite“** lässt sich der bearbeitete Abschnitt am iPhone ohne langes manuelles Navigieren kontrollieren.

### Installation mit Working Copy / GitHub Pages

Das ZIP enthält **keinen zusätzlichen Oberordner**. Entpacken, alle Dateien **direkt in das Hauptverzeichnis** des GitHub-Repositories `Chateau-Grand-2027` übertragen und vorhandene Dateien gleichen Namens ersetzen. Commit → Push. GitHub Pages Branch `main`, Verzeichnis `/ (root)`.

Anschließend GitHub-Pages-URL mit `?v=palast21` öffnen; oben rechts steht **MAXGAME-PALAST · 2.1**. Falls alte Dateien in der Working-Copy-Arbeitskopie noch offen sind, kontrollieren, dass `index.html` direkt im Repo-Root liegt.

### Validierung und Grenzen

- `chateau/architecture.js` und `chateau/main.js`: JavaScript-Syntax bestanden.
- Die Geometrie wurde mit der enthaltenen lokalen Three.js-Engine und den **geometrischen Grenzen aus dem Original-MaxGame-GLB** testweise erzeugt. Alle erzeugten Mesh-Geometrie-Koordinaten waren endlich.
- Alle 12 Säulensockel wurden auf ihre **wirklich transformierten Bounding-Boxes** gegen die drei Türöffnungen geprüft: jeweils mindestens 1,06 m freie seitliche Distanz.
- Keine Behauptung eines Safari- oder Live-FPS-Tests: Browsernavigation ist in der Ausführungsumgebung gesperrt. Die reale Bildschirmdarstellung muss auf dem Gerät überprüft werden.
- Die übrige Schlossanlage wurde **nicht neu modelliert**. Der Innenausbau ist weiterhin unvollständig, und die Türen sind bislang grafische Modelle, keine interaktiv öffnenden Türen. Eine vollständige fotorealistische Gesamtqualität ist nicht nachgewiesen.

Historische V2.0-Prüfdateien und das archivierte Château V5.10 sind als unveränderte Vorversionen enthalten. Maßgeblich für das neue Spiel sind `index.html`, `chateau/main.js` und `chateau/architecture.js`.
