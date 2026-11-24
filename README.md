# CHÂTEAU GRAND ROISSY – V3.11

**Plan- und Wandverbund-Korrektur auf Basis von V3.10.** Das Projekt startet direkt aus `index.html` in GitHub Pages. Der historische Maßstab des Hauptgebäudes bleibt bei **ungefähr 54 × 23 Metern**. Die verwendeten lichten Zimmermaße sind Näherungen aus dem veröffentlichten Grundriss von Le Rouge (1776), **nicht zentimetergenau durch Bauaufmaß belegt**.

## Was tatsächlich geändert wurde

1. **Raumachsen zentralisiert:** Die Trennwände zwischen den Zimmern werden aus denselben Raumgrenzen ermittelt, die das Raumregister von EG und OG verwendet (`chateau/roissy-config.js`). Die alten unabhängig geschätzten Teilungspositionen wurden entfernt.
2. **EG und OG getrennt:** Der östliche Abschnitt der Gartenzimmer hat in beiden Geschossen unterschiedliche Raumgrenzen. Bisher wurde die EG-Achse ungeprüft im 1. OG verwendet. Das wurde korrigiert.
3. **Querwände nach Raumplan:** 5 abgeleitete Querwandlinien im EG und 8 im OG. Insbesondere die Eckräume im 1. OG sind jetzt durch die tatsächlichen Zimmertrennungen geteilt, statt zusammenzulaufen. Die zusätzliche Trennung enthält eine begehbare Türöffnung.
4. **Lückenlose Mauerwerksanschlüsse:** Die Innenwände reichen jetzt mit definierter Überlappung bis in die 46 cm starke Außenwand sowie bis in die Querwände hinein. Davor endeten einzelne Wände bis zu 31 cm vor dem Fassadenanschluss.
5. **Historische Treppenöffnung erhalten:** Das rund 5,8 m breite Zwischenpodest benötigt den freien Durchgang im Treppenraum. Die scheinbare Wandlücke dort darf nicht zugemauert werden; der Test erkennt diese Ausnahme ausdrücklich.
6. **Bisherige Stände erhalten:** Der Natursteinboden im Vestibül, die MaxGame-Materialien, automatische Eingangstüren, 36 Stufen und die historische Raumfolge bleiben erhalten.

## Reproduzierbare technische Prüfung

```bash
node tests/audit-plan-walls-v311.mjs
node tests/validate-stair-v310.mjs
node test-building-qa.mjs
node test-v37-openings.mjs
node test-v38-partitions-fenestration.mjs
node test-v39-ceiling-shell.mjs
```

**Ergebnis:** 62 bauliche Nachbarschaftsgrenzen beider Stockwerke geprüft. 60 davon werden durch reale Trennwände abgebildet; zwei sind absichtlich freie Öffnungen für die U-Treppe. 56 Wand-Anschlusspositionen kontrolliert. 45 Innentüröffnungen und 53 Fensterpositionen geprüft. Alle 18 EG-Räume und 20 begehbaren Räume/Zonen des OG bleiben im simulierten Laufweg erreichbar; der 21. OG-Planbereich ist der Luftraum über dem Salon.

Die Prüfungen belegen interne Geometrie- und Navigationskonsistenz des Codes, **nicht** die historische Zentimetergenauigkeit und **nicht** eine visuell perfekte iPhone-Ausgabe. Ein echter Safari-WebGL-Test konnte in der Entwicklungsumgebung nicht gestartet werden.

## GitHub Pages / Working Copy

1. ZIP **entpacken**. `index.html`, `chateau/`, `vendor/`, `assets/` und alle restlichen Projektdateien direkt ins **Stammverzeichnis** von `Chateau-Grand-2027` übertragen. **Keinen zusätzlichen V3.11-Ordner hochladen.**
2. Vorhandene Dateien überschreiben, **Commit → Push**.
3. Spieladresse mit `?v=roissy311` laden. Oben rechts muss **ROISSY · V3.11** erscheinen.

## Was noch aussteht

Die ursprüngliche Historienvorlage von Le Rouge ist als Bild im Projekt `chateau/docs/` enthalten. Eine vollständige Vermessung des tatsächlich gebauten, heute nicht mehr vorhandenen Schlosses einschließlich aller Fenster- und Geschosshöhen ist nicht gesichert. Das klassische MaxGame-Portikus und die große Kuppel bleiben kreativ ergänzte Elemente, nicht Bestandteile des belegten Originalentwurfs. Diese beiden Bereiche wurden in V3.11 bewusst nicht geändert.
