# CHÂTEAU GRAND V5.7 — ARCHITEKTURREVISION

Spielbares Château-Projekt für GitHub Pages / Safari auf iPhone. Schwerpunkt dieser Version: Außenhülle, nicht Innenausbau.

## Einrichtung — wichtig!

Dieses ZIP hat **KEINEN übergeordneten Projektordner**. Entpacke es zuerst und kopiere **direkt** `index.html`, `README.md`, `src/`, `assets/`, `models/`, `docs/` sowie `IMPORTIEREN.txt` in das **Hauptverzeichnis** deines bestehenden GitHub-Repositories `Chateau-Grand-2027`.

Die vorhandene `index.html`, den bisherigen `src`-Ordner und die restlichen gleichnamigen Dateien ersetzen. Falls noch ein alter Ordner `CHATEAU-GRAND-V5.6-...` oder `CHATEAU-GRAND-V5.5-...` im Hauptverzeichnis liegt: Nicht dort hineinkopieren. Solche alten Zusatzordner sind für das Spiel nicht erforderlich.

In Working Copy: Commit → Push. Für GitHub Pages: Settings → Pages → Deploy from branch → `main` → `/ (root)`.

Öffne danach die bekannte GitHub-Pages-Spieladresse mit `?v=57` im Browser. Oben rechts muss **GRAND CHÂTEAU · V5.7** stehen. Falls V5.6 angezeigt wird, enthält das Root-`index.html` noch eine alte Version oder Pages wurde noch nicht aktualisiert.

## Geometrie-Änderungen gegenüber V5.6

- Aus den 70-cm-Lücken zwischen den Etagen wurden durchgehende Außenwände.
- Die künstlichen Dachgeschoss-Außenwände, die durch die Dachflächen schnitten, wurden durch innenliegende Dachgeschoss-Kniestöcke ersetzt.
- Den kompletten vierseitigen Dachlandschaften wurden echte geneigte obere Hippedächer statt einer weitgehend ebenen Dachplatte gegeben.
- Seitenflügel-Gauben schauen nun zur richtigen Seite, statt quer durch die Dachhaut zu ragen.
- Fehlerhaft um 90° vertauschte seitliche Gesimsbalken wurden korrigiert. Sie verursachten die störenden weißen Stäbe an den Flügeln.
- Die rückwärtige Verbindung wurde auf ganze Flügelbreite erweitert, sodass ein durchgehender vierseitiger Innenhof entsteht.
- Frontfensteröffnungen wurden nach unterschiedlichen Achsrasterbereichen aufgeteilt, damit Öffnungen sich nicht mehr überschneiden.
- Portikus mit sechs stärkeren Säulen, erneuerter Kuppel-/Eckpavillonzone und drei Eingangstüren.
- Symmetrischer Kiesweg, Grünbeete und Wege im Innenhof; 720 × 720 m Rasenlandschaft bleibt erhalten.

## Aufbau

`index.html` startet das Spiel. Die gerenderte Geometrie wird in `src/architecture.js` erzeugt; `src/app.js` enthält WebGL2, Kameras und Bedienung. `src/style.css` enthält das UI. 14 Materialdateien unter `assets/materials/` müssen mit hochgeladen werden. `models/Chateau-Grand-V5.7-Geometrie.glb` ist ein eigenständiger, farbiger Export der mobilen Geometrie zur Kontrolle/Weiterbearbeitung; die Laufzeit-App verwendet die JS-Geometrie und separaten Materialtexturen.

## Prüfung und Grenzen

- JavaScript-Syntax der beiden JS-Dateien geprüft.
- Mobile Geometrie erzeugt und als 176.486 Dreiecke mit 270 Zoneneinträgen gezählt; das sind **keine 270 ausgestatteten Räume**.
- Eigenständigen GLB-Export wieder eingelesen und die Dreieckszahl kontrolliert.
- Vier externe Kontrollrenderings aus derselben Modellgeometrie erstellt; das sind keine direkten iPhone-Screenshots.

**Wichtig:** V5.7 ist eine deutlich verbesserte Architekturgrundlage, aber **noch kein garantiert zu 85 % fotorealistisches / vollständig fehlerfreies Schloss**. Auf dem iPhone ist diese Neufassung noch nicht live geprüft worden. Freier Innenrundgang bleibt vorläufig und einige Dach-/Fassadendetails sind vereinfacht.

Die Materialtexturen stammen aus einer zuvor bereitgestellten Projektdatei. Lizenzen vor kommerzieller Nutzung unabhängig prüfen.
