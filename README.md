# CHÂTEAU GRAND 2027 · MAXGAME-PALAST V2.4

## Völlig frei durch die Eingänge gehen – wie im Herrenhaus

Dies ist das **vollständige GitHub-Pages-Projekt**, direkt als Ersatz für die V2.3. Es bleibt bei der MaxGame-Three.js-Engine, der ca. 224 m breiten Schaufassade, dem Herrenhaus-Portikus, den 18 Roissy-Raumzonen im EG, 21 Raumzonen im 1. OG und transparenten Fenstern.

**Neu und funktionsfähig auf Modellniveau:**

- Der Klick auf **„Château erkunden“** startet **direkt im Schlosspark**, nicht in einem teleportierten Zimmer.
- Zu Fuß über die **26 großen Außentreppenstufen** bis zur Terrasse.
- **Drei bewegliche Eichendoppeltüren** nach dem Türsystem von MaxGame; sie öffnen sich automatisch bei Annäherung und schließen wieder, wenn du weggehst.
- **Echte begehbare Türöffnungen** und **Wandkollisionen**: Außerhalb der Türen sind die Wände nicht mehr einfach durchquerbar.
- Durch das Vestibül und die historischen Raumfolgen gehen, ohne die Kamera neu zu positionieren.
- Im westlichen **Grand Escalier** zwei Läufe mit je zwölf Stufen und ein Zwischenpodest **zu Fuß auf- und absteigen**. Die Laufhöhe wird an die konkreten Stufenkoordinaten angepasst. Am oberen Treppenabsatz wurde eine fehlende Gangbrücke ergänzt.
- Vom Hauptbau durch reale Öffnungen in den westlichen/östlichen Seitenflügel, von dort in den hinteren Quertrakt laufen (EG).
- Einblendung der aktuellen Umgebung und des Raum-/Geschossnamens beim Rundgang.
- **Keine Verdunkelung der Fenster**: Die zwei- bzw. beidseitig sichtbare MaxGame-Verglasung aus V2.3 bleibt erhalten.

### Steuerung auf dem iPhone

- **Links auf der Spielfläche ziehen:** vorwärts/rückwärts und seitlich laufen.
- **Rechts auf der Spielfläche ziehen:** Blickrichtung verändern.
- **Eichentüren:** ohne Button automatisch öffnen, wenn du darauf zuläufst.
- **Rundgang neu:** erneut vom Park starten. **Zurücksetzen:** Kamera- und Fassadenansichten öffnen.
- Die Ansicht von **EG · Grundriss** und **1. OG · Grundriss** bleibt optional – du musst sie zum Betreten nicht benutzen.

Auf dem Computer: **WASD oder Pfeiltasten** zum Laufen, mit gedrückter Maus ziehen, um die Blickrichtung zu ändern.

### Tatsächlicher Testablauf

Die **aktive Geometrie** wurde in Node.js mit dem Original-MaxGame-GLB geladen. Anschließend wurde die Bewegung als Folge von über 3.700 kleinen Bewegungs-/Kollisionsschritten geprüft:

1. Schlosspark → Außentreppe → mittlere Eichentür → Vestibül
2. Vestibül → Grand Escalier → erster Treppenlauf → Zwischenpodest → zweiter Treppenlauf → Galerie des 1. OG
3. Derselbe Weg **zu Fuß zurück** bis zum Schlosspark
4. Vestibül → westliche Raumfolge → Seitenflügel → hinterer Quertrakt

Jeweils wurde die tatsächliche Kollision mit Wänden und bewegten Eichentürflügeln berücksichtigt. Auch beide äußeren Türöffnungen wurden im Geometriemodell geprüft.

**Einschränkung:** Eine iPhone-Safari-Liveprüfung war in dieser Umgebung nicht möglich. Die historischen Räume des Haupttraktes sind als Wand- und Raumstruktur vorhanden, aber noch nicht vollständig möbliert. Seitenflügel und Rücktrakt sind zusammenhängend begehbare Gebäudeschalen, jedoch noch nicht vollständig als einzelne Zimmer ausgebaut. Mehr als zwei ausgebaute Geschosse sollten noch nicht behauptet werden.

## GitHub Pages / Working Copy

1. ZIP entpacken.
2. **Alle Dateien und Ordner auf die oberste Ebene** deines bestehenden GitHub-Repositories `Chateau-Grand-2027` kopieren. `index.html` liegt **direkt im Hauptverzeichnis**, nicht in einem V2.4-Unterordner.
3. Bestehende gleichnamige Dateien überschreiben.
4. **Commit → Push**.
5. GitHub-Pages-Adresse mit `?v=palast24` öffnen; Anzeige **MAXGAME-PALAST · 2.4** prüfen.

Schlüsseldateien: `chateau/main.js` (Steuerung), `chateau/navigation.js` (Laufhöhen und Kollision), `chateau/architecture.js` (begehbare Türen und Gebäude), `wohnzimmer/portal-doors-v2.js` (originale MaxGame-Türmechanik), `assets/white-house-structure.glb` (bestehendes 3D-Donormodell).
