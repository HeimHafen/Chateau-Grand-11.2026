# Château Grand Roissy V3.15 – Innenarchitektur

Basierend auf V3.14. Keine Änderung der historischen Raumachsen, Außenhülle, Dachform, Fensterraster, Treppenabmessungen oder Navigation. Die Innenraumfarben und Materialien sind eine historisch inspirierte, nicht dokumentierte Rekonstruktion.

## Gestaltung
- Eigenständige warme Kalkputz- und Boiserie-Materialien an tatsächlichen Innenwandflächen statt des äußeren Mauerwerks. Zweistufige Profile, Sockel, Dado, Wandfelder und Gesimse. 45 Türbekrönungen, Öffnungen bleiben vollständig frei.
- 33 benannte Raumzonen mit Holz- oder Steinbelag, ergänzt durch Steinflächen im übrigen Geschoss. Eichenparkett im Tafelverband mit eigenständig erzeugten Farb- und Normaltexturen, UVs in Metern. Bestehender Vestibülboden, Stufen und Salon-/Treppenlufträume unverändert. Keine neuen Möbel.
- 50 Deckenfelder mit Profilleisten, darunter 9 Kassetten pro Vestibülgeschoss; sieben geschmiedete Galerieornamente; sechs dreidimensionale Messinglaternen mit warmem Leuchtkern. Zwei dynamisch auf benachbarte Raumzentren verteilte, schattenfreie Innenlichter (kein neuer Außenscheinwerfer).
- Schnellzugang über „Innenräume …“ zu Vestibül, Salon, Grand Escalier und Galerie. In der Außenansicht oder nach Zurücksetzen verfügbar.

## Prüfung
- 138 nicht überlappende neue Bodenfelder, kein Eingriff in obere Lufträume. 4 Startpositionen frei. Vier Finishstreifen an querliegenden Türen lokal beschnitten. 45 Türöffnungen und 73 Fenster durch Regressionstests geprüft. 1.020 Schritte auf der Haupttreppe erfolgreich simuliert. 10.859 Boxen im bestehenden Entflechtungssystem, keine verbleibenden gleichgerichteten koplanaren Boxflächenüberschneidungen. Neue Dekoration wird weiterhin in Materialbatches gerendert (56 Batches, dazu individuelle Meshes). Keine belastbare FPS-Messung.
- Reproduzierbare Prüfungen: `node --experimental-default-type=module tests/validate-interior-v315.mjs`, `tests/validate-surfaces-v314.mjs`, `tests/validate-stair-v310.mjs`, `tests/validate-exterior-v313.mjs`, `test-v313-openings.mjs` (jeweils mit dem gleichen Node-Befehl).
- Einschränkung: WebGL2 ist in der verfügbaren Chromium-Testumgebung nicht verfügbar. Keine visuelle Endfreigabe auf Safari/iPhone und keine Garantie vollständiger Flackerfreiheit außerhalb der geprüften Boxflächen. Historischer Grundriss und Raummaße bleiben näherungsweise, Nebentreppen und weitere ursprüngliche Details sind nicht vollständig rekonstruiert.

## Installation
ZIP komplett entpacken, Inhalt in die Wurzel des bestehenden GitHub-Repositories kopieren und vorhandene Dateien ersetzen. Commit und Push. Aufruf `?v=roissy315`, Anzeige `ROISSY · V3.15`.
