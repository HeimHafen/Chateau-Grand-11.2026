# CHÂTEAU GRAND ROISSY – V3.12

Vollständiges Austauschpaket, basierend auf V3.11. Referenz: `chateau/docs/CHATEAU-DE-ROISSY-REFERENZ-HOCHAUFLOESEND.jpg` (Le Rouge, 1776).

## Änderungen
- 38 cm hohe Lücke zwischen Sockel und Fassadenmauerwerk geschlossen; Türstürze und Geschossfugen in den Innenwänden geschlossen.
- Vestibül: vier freistehende Kalksteinsäulen pro Geschoss in zwei Reihen, mit Sockeln, Kapitellen, durchgehenden Deckenträgern und Kollisionskörpern. Positionen aus der sichtbaren Stützenordnung angenähert. Natursteinfläche an tatsächliche Wandinnenflächen angepasst (13,19 × 13,278 m), zweifacher umlaufender Steinfries. Sockelprofile aus realen Wandsegmenten abgeleitet, statt pauschaler Abstände.
- Salon: vollständig eingefasster Portalsturz, durchgehender Brüstungsabschluss, engmaschiges Schmiedeeisengeländer mit Holzhandlauf und Kollision.
- Grand Escalier: 36 Stufen erhalten; Innenkanten beider Treppenläufe mit Geländern versehen, Zwischenpodest mit zusätzlichen Stäben gesichert, neue tragende Geschossfläche vor der Treppe im OG, westliche Tür ins echte Podest verlegt. Kollisionsprüfung nutzt reale obere Geschossflächen statt pauschaler Freigabe über dem Treppenloch.
- Fenster: umlaufende Rahmen, innenliegende Steinlaibungen und Fensterbänke. Achsen der V3.11 bleiben erhalten.

## Nachgewiesene technische Prüfung
Alle folgenden Node-Tests wurden erfolgreich ausgeführt:
```
node tests/validate-v312-real-asset.mjs
node tests/validate-stair-v310.mjs
node tests/audit-plan-walls-v311.mjs
node test-building-qa.mjs
node test-model.mjs
node test-v36-vestibule.mjs
node test-v37-openings.mjs
node test-v38-partitions-fenestration.mjs
node test-v39-ceiling-shell.mjs
```
Die erste Prüfung lädt tatsächlich die originale GLB-Datei (25 Portikusbauteile), nicht nur Ersatzgeometrie. 18 EG- und 20 OG-Raumzonen im Raster erreichbar, 45 Innentüröffnungen und 53 Fensterpositionen frei, 56 Wandanschlüsse kontrolliert. 1020 Schritte auf der Haupttreppe hinauf und hinab; 195 zusätzliche Schritte durch den neuen OG-Verbindungsweg. Ein Salonluftraum bleibt absichtlich unbegehbar.

## Noch nicht abgeschlossen
Die historische Außenkontur ist gestaffelt, während der bestehende Hauptbau weiterhin eine vereinfachte rechteckige Hülle von 54 × 23 m besitzt. Die tatsächliche historische Wand- und Raumgeometrie, Fassadenstaffelung, sekundären Treppen und exakten Höhen sind nicht vollständig rekonstruiert. Der MaxGame-Portikus und die Kuppel sind kreative Ergänzungen. Die Säulen- und Bodendetails sind historisch plausible Interpretationen, kein Originalaufmaß. Visuelle WebGL-/Safari-Freigabe fehlt: Chromium-Navigation im Testsystem wurde mit ERR_BLOCKED_BY_ADMINISTRATOR abgewiesen. Alte Vorschau.jpg ist eine Bestandsreferenz und zeigt NICHT V3.12. Die automatisierten Prüfungen ersetzen keinen visuellen Rundgang.

## Installation / Working Copy
1. ZIP entpacken, gesamten Inhalt direkt ins Stammverzeichnis des bestehenden Repositorys übertragen und Dateien ersetzen.
2. Commit und Push. GitHub-Pages-Adresse mit `?v=roissy312` neu laden.
3. Oben rechts muss `ROISSY · V3.12` erscheinen.
