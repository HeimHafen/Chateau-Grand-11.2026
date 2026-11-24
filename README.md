# CHÂTEAU GRAND – ROISSY V3.5 – GESAMTABGLEICH

**Vollständiges spielbares GitHub-Pages-Projekt.** Ausgangsbasis ist der geprüfte Stand V3.4. Historischer Kernbau: ca. 54 × 23 m, Planvorlage von Le Rouge (1776); die Maßwerte sind aus einer gedruckten Skala abgeleitet, **keine zentimetergenaue historische Vermessung**.

## Überarbeiteter Gesamtstand

- **Erdgeschoss / 1. Obergeschoss:** Planregister mit 18 EG-Räumen und 21 OG-Einträgen (20 begehbare Bereiche plus ein absichtlicher Salon-Luftraum) erhalten. Zusätzlich überprüft der Modellstart die Überlappungsfreiheit der Raumflächen.
- **Innenwände / Durchgänge:** Raumachsen bleiben erhalten. Die Navigation prüft tatsächliche Kollisionsgrenzen und Türdurchgänge. Ein separater Raster-Reachability-Test misst die Erreichbarkeit aller Räume ohne Teleportieren.
- **Außentreppe:** Alle sieben sichtbaren Steinhöhen stimmen exakt mit der begehbaren Stufensteuerung überein (keine unsichtbare Rampe mehr).
- **Haupttreppe / Galerie:** 36 Tritte und die zugehörige Laufhöhenberechnung sind synchronisiert; beide Treppenläufe und der Galerieabschluss aus V3.4 bleiben erhalten.
- **Fenster:** Beidseitig transparentes Material, echte Außenwandöffnungen. Beim Aufbau wird jede Fensterreihe auf Überschneidungen und Außenkanten geprüft.
- **Dach:** Dachwalme erhalten neue exakt an den Schnittlinien platzierte Zink-/Metallabschlussprofile und einen durchgehenden First, statt frei schwebender Balken. Die 14 vorhandenen Dachgaubenöffnungen bleiben erhalten.
- **Außenanschlüsse:** Isolierte seitliche Treppenstufen ohne zugehörige Tür wurden entfernt. Sie waren konstruktiv unlogisch und führten gegen eine Fensterbrüstung. Die historische Position der seitlichen Zugänge muss vor dem Neuanlegen anhand einer Quelle vermessen werden.
- **Portikus:** Die vorhandenen MaxGame-3D-Säulen und die drei automatischen Türen bleiben erhalten. Der Portikus ist ein eigener kreativer Schlosszusatz, kein historischer Nachweis für Roissy.

## Installation

ZIP **ohne übergeordneten Ordner** entpacken. Sämtliche Dateien im Stammverzeichnis von `Chateau-Grand-2027` ersetzen, Commit → Push. Danach die Spieladresse mit `?v=roissy35` öffnen. Das Versionsetikett lautet **ROISSY · V3.5**.

## Qualitätsgrenzen

Der historische Grundriss ist im Kern maßstäblich rekonstruiert, jedoch nicht zentimetergenau belegt. Vor allem Fassadenhöhen, einige Wandstärken, die künstlerische Kuppel und der MaxGame-Portikus sind derzeit nicht historisch gesichert. Ein echter iPhone-Safari-Livetest ist hier aufgrund der gesperrten lokalen Browserumgebung nicht möglich. **V3.5 ist ein nachweisbar weiterentwickelter Konstruktionsstand, kein Versprechen von 100 % fotorealistischer oder bauarchäologischer Perfektion.**

## Reproduzierbare Tests

Im Projektroot: `node test-model.mjs` und `node test-building-qa.mjs`. Der zweite Test führt einen 25-cm-Rastertest für alle erreichbaren Zimmer aus und kontrolliert sieben Außentreppenstufen. Er beweist keine visuelle iPhone-Grafikqualität.
