# CHÂTEAU GRAND 2027 – MAXGAME-PALAST · V2.0

**Komplette spielbare GitHub-Pages-Projektbasis, entstanden aus der funktionierenden MaxGame-Neubasis 1.0.** Der äußere Schlosskomplex wurde erheblich vergrößert und architektonisch ausgearbeitet, als nächster greifbarer Schritt zum monumentalen Zielentwurf.

## Wichtig: Installation in GitHub / Working Copy

1. ZIP **entpacken**.
2. **Den Inhalt des ZIP direkt ins Hauptverzeichnis** deines bestehenden Repositorys `Chateau-Grand-2027` kopieren. `index.html` liegt im Root, **kein zusätzlicher Projektordner**.
3. Alle bereits vorhandenen gleichnamigen Dateien ersetzen. `chateau/`, `assets/`, `wohnzimmer/` und `vendor/` müssen zusammen hochgeladen werden.
4. **Commit → Push** in Working Copy.
5. Die GitHub-Pages-Spieladresse mit `?v=palast20` öffnen. Oben rechts steht **MAXGAME-PALAST · 2.0**.

## Was in V2.0 tatsächlich im 3D-Spiel gebaut wurde

- **Schauseite: 224 m breit** statt zuvor 94 m, Gesamtanlage ungefähr 224 × 217 m, höchster Kuppelabschluss ca. 61 m über dem Terrain.
- Hauptbau mit vier gestaffelten Steingeschossen, langen Gesimsen, sichtbaren Sockeln und durchgängigem Steinmaterial.
- **Zwei große Seitenflügel**, gegliederte Außenfassaden **und Innenhoffassaden**, rückwärtiger Quertrakt. Alle langen Wände besitzen regelmäßig ausgesparte Fensteröffnungen und gegliederte Steineinfassungen statt bloßer Materialbilder.
- Monumentaler Front-Portikus: aus den **tatsächlich vorhandenen Herrenhaus-GLB-Bauteilen** übernommen und mit insgesamt zwölf originalen parametrischen MaxGame-Säulen erweitert; einschließlich Giebel, Kapitellen, Gesims und breiter Freitreppe.
- **Zentrale große 3D-Kuppel**, vier Kuppelpavillons an den Ecken, ein weiterer rückwärtiger Kuppelpavillon: sechs sichtbare Kuppeln mit steinernen Tambouren, gebogenen Kupferrippen und Laternenabschlüssen.
- Gewalmte Mansarddächer mit Gauben an den äußeren und inneren Dachseiten; Stone-Balustrade mit Geländerpfosten und Zierabschlüssen.
- Parkachse, modellierte Zugangswege, begrünter Innenhof, symmetrische Parterres, Zypressen und zwei Brunnenbecken.
- MaxGame-PBR-Texturen, Abendhimmel, Glas und dezente Emissionsbeleuchtung an ausgewählten Fenstern.
- Außenansicht mit Orbit-/Pinch-Gesten, Schauseite, Perspektive, Luftübersicht und freiem Außenrundgang mit mobiler Touch-Steuerung.
- Das alte Château V5.10 ist als Archiv erhalten. `maxgame-original.html` startet weiter das unveränderte Originalprojekt.

## Technischer Test (aus der aktiven `chateau/architecture.js`)

- Original-GLB: 533 Spender-Bauteile erfolgreich eingelesen.
- Neue Szene: 277 Render-Meshes, davon 22 Instancing-Batchtypen für **18.070** wiederholte Detail-Bauteile.
- Ungefähr 565.288 tatsächlich instanziierte Dreiecke im Desktop-Testaufbau (Mobil kann geringfügig abweichen).
- 23 Portikus-Baugruppen, darunter 12 aus MaxGame-Originalsäulen zusammengesetzte Säulengruppen.
- Szenengrenzen ~226 × 347 × 61 m (der zusätzliche Raum ist für die Vorfahrt und die Gartenelemente).
- Keine fehlende Mesh-Geometrie, keine nicht-endlichen Geometrie-Koordinaten im durchgeführten Node-Three.js-Test.
- Code-Syntax und ZIP-Dateistruktur geprüft.

**Ehrliche Einschränkung:** Dies ist ein erheblich weiterentwickelter, *spielbarer Code- und Geometriestand*, **keine fotorealistische 1:1-Reproduktion** des zuvor als Vision erzeugten Konzeptbilds. Ein grafischer Test im echten Safari auf deinem iPhone war hier nicht möglich, da der lokale Headless-Browser Webseitenaufrufe blockiert. Innenräume und echte Treppennavigation sind noch nicht fertig; „Erkunden“ ist derzeit ein Außenrundgang. Eine garantiert flüssige mobile Bildrate ist damit nicht nachgewiesen.

## Projektstruktur

`index.html` — startet das aktuelle Château; `chateau/architecture.js` — tatsächlich verwendete Architektur; `chateau/main.js` — Game-Engine, Steuerung, Licht und Kameras; `assets/` — Modelle und Materialbilder; `wohnzimmer/` — originale MaxGame-Material- und Portikusmodule; `vendor/three/` — lokale 3D-Engine; `maxgame-original.html` — Start des Originals; `chateau/legacy/` — altes Château als Sicherung; `chateau/docs/TESTREPORT-V2.json` — maschinenlesbarer Geometrietest.

Die ursprüngliche `START.txt` bezieht sich weiterhin auf MaxGame. Die neue Einrichtungsanleitung steht in `IMPORTIEREN.txt` beziehungsweise hier.

**Lizenz:** Vor einer kommerziellen Veröffentlichung bitte die Rechte am übernommenen MaxGame-GLB und sämtlichen Originaltexturen prüfen. Die Hinweise in `ATTRIBUTION-MODELLE-V22.md` und die Three.js-Lizenz bleiben erhalten.
