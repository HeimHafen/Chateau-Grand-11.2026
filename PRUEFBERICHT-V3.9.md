# Qualitätsprüfung Roissy V3.9

## Getestete Konstruktion

| Prüfobjekt | Ergebnis |
|---|---|
| Außenwand- und Fußbodenfuge | Geschlossen, jeweils 3,0 cm Materialüberdeckung |
| OG-Platte über Salon | Frei ausgeschnitten, ohne Deckeninvasion |
| OG-Platte über Grand Escalier | Frei ausgeschnitten, ohne Deckeninvasion |
| Neue Abschlusssegmente an Deckenkanten | 8, im massiven Material verankert |
| Deckenunterseiten | Kontinuierlich nur auf vorhandenen Plattenstücken |
| Innentüren | 44/44 frei im Geometrie-Prüfkern |
| Fenster-zu-Raumwand-Test | 53 Positionen, keine Kollision |
| EG-Begehbarkeit | 18/18 Zonen |
| 1. OG-Begehbarkeit | 20/20 begehbare Zonen; der Salon ist Luftraum |
| Treppenbegehbarkeit | Aufstieg und Abstieg über 36 Stufen bestanden |
| Außentreppe | 7 Stufen entsprechen den Navigationhöhen |

Diese Prüfungen messen 3D-Daten und simulierte Wege. Sie sind keine optische Safari-Abnahme. Die historische Genauigkeit aller Raumhöhen und Materialien ist ebenfalls nicht zentimetergenau belegt.

### Reproduzierbare Tests

```sh
node test-v39-ceiling-shell.mjs
node test-v38-partitions-fenestration.mjs
node test-building-qa.mjs
node test-model.mjs
```

### Maßkoordinaten

Wandmittelachsen x = ±27,00 m und z = ±11,50 m, Mauerdicke 0,46 m; lichte Innenseiten x = ±26,77 m, z = ±11,27 m. Plattenränder x = ±26,80 m, z = ±11,30 m. Deren 3-cm-Überstand in den Wandkörper ist konstruktiv beabsichtigt.
