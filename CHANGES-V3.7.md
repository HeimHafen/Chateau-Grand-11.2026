# Änderungen V3.7 – Roissy Tür- und Wandanschlüsse

Ausgangspunkt: V3.6, basierend auf dem vom Nutzer eingesandten Screenshot (1. OG, Chambre à coucher).

## Nachweisbare Fehler in V3.6

1. **EG, westliche Raumfolge**: Die Tür im Trennwandzug x = −21,93 m war auf z = 5,30 m gesetzt. Sie wurde in der lichten Durchgangsfläche von der Querwand z = 5,35 m um ca. **13,5 cm** eingeschränkt.
2. **1. OG, Ostseite**: Die Tür im Wandzug x = 20,46 m stand ebenfalls auf z = 5,30 m und wurde von der Querwand z = 4,97 m um ca. **7,5 cm** eingeschränkt.
3. **Türrahmen**: Bei den üblichen Innentüren lag die untere Kante des Sturzes bei y + 2,70 m, obwohl der konstruktiv vorgesehene Türbereich bis y + 2,90 m offen war. Dadurch wirkte der sichtbare Sturz zu tief.

## Geometrische Korrektur

- Diese zwei Türzentren nach z = 7,30 m auf freie Wandstücke verschoben; die betreffenden Raumfolgen bleiben weiterhin verbunden.
- Lichte Höhe der Innentüren durch einheitliche Sturzposition auf **2,80 m** gesetzt; senkrechte Laibungselemente reichen passend bis an den Sturz.
- `architecture.js` gibt `interiorDoorways` an das QA-Skript aus. Damit werden **44 tatsächliche Öffnungen** auf räumliche Überlagerungen mit Wand- und Rahmenquadern getestet.
- EG/1. OG-Grundriss, Außenbau, Dach, Kuppel, Eingangshalle und sieben Außentreppenstufen wurden nicht neu entworfen.

## Prüfung

- `node test-v37-openings.mjs` – 44 Öffnungen, 0 Überschneidungen im geprüften lichten Bereich
- `node test-model.mjs` – Modell, Laufweg vom Park zur Haupttreppe, Aufstieg und Abstieg
- `node test-building-qa.mjs` – 18/18 EG-Räume und 20/20 begehbare OG-Zonen erreichbar
- `node test-v36-vestibule.mjs` – Bodenbelag und Portikusanschluss regressionsgeprüft

**Einschränkung:** Die historischen Positionen der verschobenen Durchgänge sind aus dem Grundriss angenähert und nicht zentimetergenau durch Befundaufnahme nachgewiesen. Kein erfolgreicher WebGL-/iPhone-Safari-Bildtest in dieser Umgebung; die optische Endqualität bleibt offen.
