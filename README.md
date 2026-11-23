# Château Grand 2027 – MaxGame-Neubasis · Version 1.0

**Spielbare neue Château-Basis, aufgebaut auf dem tatsächlich gelieferten MaxGame-Projekt.**

## Was jetzt beim Öffnen passiert

`index.html` startet ab jetzt **CHÂTEAU GRAND** mit der originalen lokalen Three.js-Engine von MaxGame, dem Original-GLB des Herrenhauses, dem Original-Portikus mit seinen acht modellierten kannelierten Säulen und den vorhandenen MaxGame-Materialien. Das neue Schloss bekommt eine 94 Meter breite, dreigeschossige Frontfassade mit tatsächlichen Wandöffnungen, Fenstergliederung und drei zweiflügeligen Eingängen. Zur Orientierung sind vereinfachte rückwärtige Gebäudetrakte und eine Rasenlandschaft vorhanden.

**Wichtig:** Wir haben *nicht* das gesamte bisherige Château auf Herrenhaus-Qualität gebracht. Dieser erste Schritt überträgt die belastbare Spieltechnik und das echte Referenzbauteil. Die Dachanschlüsse, Kuppel und Innenräume müssen in folgenden kontrollierten Einzelschritten bearbeitet werden. Die neue Vorschau ist kein Nachweis von Fotorealismus auf dem iPhone.

## Installation mit Working Copy / GitHub Pages

1. ZIP **entpacken**.
2. **Alle Dateien und Ordner direkt in das Hauptverzeichnis** des Repositorys `Chateau-Grand-2027` übertragen. **Keinen zusätzlichen Oberordner** anlegen.
3. Bestehende gleichnamige Dateien ersetzen.
4. In Working Copy **Commit** und anschließend **Push** ausführen.
5. GitHub → **Settings → Pages** → Branch `main`, Ordner `/ (root)`.
6. Deine bisherige GitHub-Pages-Adresse öffnen, zum Erzwingen einer frischen Seite `?v=maxgame1` anhängen. Oben rechts sollte `MAXGAME-NEUBASIS · 1.0` stehen.

`index.html` und die Unterordner `chateau/`, `wohnzimmer/`, `vendor/`, `assets/` dürfen nicht voneinander getrennt werden.

## Ein Bereich nach dem anderen

**Aktueller Bereich: zentrale Schaufassade / Portikus**, mit dem aus MaxGame übernommenen Modell. Die Seitenflügel und Dachlandschaft sind als einfaches Volumenmodell nur zur Orientierung vorhanden, noch nicht auf Endniveau. Danach gehen wir genau einen neuen Bereich an.

## Herkunft / Inhalt

- `vendor/three/`: lokale Three.js-Version und GLTFLoader **aus deiner MaxGame-ZIP**, inklusive mitgelieferter Lizenz
- `assets/white-house-structure.glb`: Original-GLB aus MaxGame, **533 vorhandene Modellobjekte**, aus dem Portikus, Stufen, Giebel und Säulenunterbau übernommen werden
- `wohnzimmer/portico-columns-v2.js`: originale parametrische Kanneluren- und Steinprofildetails der MaxGame-Säulen
- `wohnzimmer/exterior-materials-portikus-kalkstein.js`: originale PBR-Materialbibliothek mit Kalkstein-, Relief- und Rauheitsdetails
- `wohnzimmer/window-glass.js`, `wohnzimmer/sky-atmosphere.js`: originales Glas und Himmel
- `assets/`: sämtliche MaxGame-Bilder und -Modelle; inklusive Gras, Kalkstein und Dachmaterialien
- `chateau/architecture.js`: neue, noch nicht vollständig ausgebaute Château-Architektur auf der MaxGame-Basis
- `chateau/main.js`: eigenständige Steuerung, Kamera, Licht und Renderer für das Château
- `maxgame-original.html`: **MaxGame-Original** weiterhin separat spielbar (der Originalprojekt-Code bleibt erhalten)
- `chateau/legacy/CHATEAU-GRAND-V5.10-ARCHIV.zip`: bisheriger Château-Spielstand vor dem MaxGame-Wechsel, nur Archiv

Die originale `START.txt` beschreibt weiterhin das alte MaxGame und bleibt aus Gründen der Quellenintegrität erhalten. Für die neue Château-Installation gilt **dieses README**.

## Technik und Prüfung

- GLB wurde mit einem unabhängigen Three.js-Import geladen: 533 Spenderobjekte
- die Château-Baugeometrie wurde anschließend mit der lokal enthaltenen Three.js-Version erfolgreich aufgebaut: **877 Meshes**, **183.776 Dreiecke** im geprüften Modellaufbau
- die originale Portikuskonstruktion erzeugte **19 Baugruppen**: originale Bauteile plus acht Säulengruppen
- alle überprüften Modulimporte sind im Paket vorhanden; `node --check` erfolgreich
- keine vollständige visuelle iPhone-Safari-Prüfung in dieser Umgebung; auf dem Gerät müssen Steuerung, Materialien und Licht kontrolliert werden

## Lizenzhinweis

Die Originaldateien und der Original-Hinweis `ATTRIBUTION-MODELLE-V22.md` bleiben erhalten; Three.js behält seine `vendor/three/LICENSE`. Vor einer kommerziellen Veröffentlichung müssen zusätzlich die Nutzungsrechte der übernommenen Modelle und Texturen geprüft werden.
