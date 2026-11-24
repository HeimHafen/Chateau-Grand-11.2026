# Qualitätsprüfung – Château Grand Roissy V3.5

## Gegenstand

Vollständiger Spielstand auf MaxGame/Three.js-Basis mit historisch angenäherter Raumaufteilung nach Le Rouge (publiziert 1776). Der ursprüngliche Hauptbau wurde um 1703–1709 errichtet. Ein zentimetergenaues denkmalpflegerisches Aufmaß ist **nicht** Bestandteil der verfügbaren Unterlagen. Die künstlerische Kuppel und der MaxGame-Portikus sind spätere eigene Gestaltung und keine original belegten Roissy-Bauteile.

## Automatisierte Prüfungen

| Prüffeld | Ergebnis |
|---|---|
| Grundkörper in einem Maßsystem | 54 m × 23 m; **geschätzte** historische Größenordnung |
| EG-Raumflächen | 18 getrennte, ohne gegenseitige Überlappung |
| 1. OG | 20 getrennte Räume plus ein nicht begehbarer zweigeschossiger Salon-Luftraum |
| Physische Erreichbarkeit im 25-cm-Prüfraster | EG 18/18, OG 20/20 |
| Route Außengelände → Haupteingang → Salon → Haupttreppe → OG | Test bestanden |
| Route OG → EG über beide Treppenläufe | Test bestanden |
| Außentreppe | 7 Stufen, jeweils sichtbare Höhe = Laufhöhe |
| Historisches Haupttreppenhaus | 36 Stufen, sichtbare Trittflächen = Laufhöhen |
| Außenfensterachsen | Keine berechneten Fensterüberschneidungen oder Durchdringungen der Gebäudeecken |
| Dachgauben | 14 der Dachneigung zugeordnete Öffnungen; Verglasung und Rahmen weiter vorhanden |
| Dachfirst und Dachgratprofile | 1 First und 8 Grate auf den berechneten Dachkanten; Traufen zusätzlich profiliert |
| Isolierte Seitenstufen ohne Zugang | Entfernt |
| Material-/GLB-Dateien | Original-MaxGame-GLB eingebunden; lokal vorhanden |
| Drei Eingangstüren | Bewegliche MaxGame-Eichentüren im Modell enthalten |
| JavaScript-Module | Syntaxprüfung erfolgreich |
| Archiv | ZIP nach Erstellung zu prüfen; Dateien im Repository-Root |

## Was nicht nachgewiesen ist

- Exakte historische Zimmergrößen und Geschosshöhen, Millimetermaße der Öffnungen sowie der genaue Außenbauzustand des 18. Jahrhunderts: dafür fehlen gesicherte Aufmaße; vorhandene Werte sind Zeichnungsrekonstruktionen.
- Sämtliche Material- und Lichtwirkungen direkt in Safari, Kantenflimmern, Schatten- und Glasqualität: lokaler Browserzugang ist in dieser Umgebung gesperrt.
- Architektonische 100-%-Perfektion, dokumentierte Statik, tatsächliche stufenlose Erreichbarkeit und Kollisionsverhalten bei allen beliebigen Diagonalbewegungen.
- Nicht belegte seitliche historische Nebenzugänge: bis sie exakt rekonstruiert sind, wurden die bisherigen ins Leere führenden Außentreppe-Stufen entfernt.

## Wiederholbare Tests

Im Projektroot `node test-model.mjs` sowie `node test-building-qa.mjs` ausführen. Der zweite Test kontrolliert das Gebäuderaster und die Außentreppe. Beide Tests benötigen keine Verbindung ins Internet.
