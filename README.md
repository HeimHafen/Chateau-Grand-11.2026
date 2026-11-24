# CHÂTEAU GRAND – ROISSY V3.2 – DACHGAUBEN & ECHTE FENSTERÖFFNUNGEN

**Komplettes, auf V3.1.1 basierendes GitHub-Pages-Projekt.** In V3.2 wurde gezielt die Geometrie der Dachgauben überarbeitet, weil die Schiefer-Dachhaut und massive Steinquader zuvor direkt hinter den Gaubenfenstern lagen.

## Was sich geändert hat

- **14 echte Dachöffnungen:** sieben Fensterachsen auf der vorderen, sieben auf der hinteren Dachschräge. Die Schieferflächen sind an der betreffenden Stelle in einzelne Dreiecksflächen aufgeteilt; der Fensterdurchblick wird nicht länger durch ein durchgehendes Dachpolygon versperrt.
- **Hohle Gaubenrahmen statt Steinblöcke:** seitliche Wangen, Sturz und Sohlbank umgeben die Glasscheibe. Die früher vorhandene massive Steinrückwand wurde entfernt.
- **Achsengenaue Lage:** Die Dachöffnungen sind in Weltkoordinaten an derselben X-Achse wie die Gauben ausgerichtet. Der bisher mögliche seitliche Versatz zum Dachrand ist beseitigt.
- **Fensterflügel:** transparente Scheiben und schlanke Sprossen; die vorhandenen MaxGame-Glasmaterialien werden weiterverwendet.
- **Erhalten:** die historische Grundrisskonfiguration, 54 × 23 m Maßannahme, EG (18 Raumzonen), 1. OG (21 Raumzonen), offener Salon, Haupttreppe, automatische Eingangstüren, Terrain und gesamtes andere äußere Modell.

Die große Portikus-Konstruktion und die Kuppel bleiben gestalterische Erweiterungen und sind **keine nachgewiesenen Originalbauteile** von Château de Roissy.

## Einspielen in Working Copy / GitHub Pages

1. ZIP entpacken. Alle Dateien **direkt** ins Root-Verzeichnis des vorhandenen Repositories `Chateau-Grand-2027` kopieren; **keinen zusätzlichen Oberordner** anlegen.
2. Vorhandene Dateien ersetzen, besonders `index.html`, `chateau/architecture.js`, `chateau/main.js` und `chateau/roissy-config.js`.
3. **Commit → Push**, anschließend deine GitHub-Pages-Adresse mit `?v=roissy32` laden.
4. Oben rechts soll **ROISSY · V3.2** erscheinen. Gauben frontal und von der Dachseite prüfen; Rundgang im EG/1. OG weiterhin testen.

## Technische Prüfung

- `node --check` für alle 13 direkt oder indirekt verwendeten lokalen JavaScript-Module: **bestanden**.
- 14 Dachöffnungen rechnerisch auf ihre Lage **innerhalb des realen Dachrands** und auf die Lage der Fensterachsen geprüft: **bestanden**.
- Referenziertes MaxGame-Originalmodell mit den erforderlichen Portikus-Teilen vorhanden.
- Alle für die Steuerung nötigen HTML-Knoten, die in V3.1.1 ergänzt wurden, bleiben enthalten.
- Die ausführlichen Prüfwerte stehen unter `chateau/docs/ROISSY-V3.2-GAUBEN-PRUEFUNG.json`.

**Einschränkung:** Ein echter lokaler Browser-/iPhone-Safari-Livetest konnte nicht abgeschlossen werden, weil die Testumgebung den lokalen Browserzugriff blockiert (`ERR_BLOCKED_BY_ADMINISTRATOR`). Deshalb ist die sichtbare Darstellung und Performance auf dem iPhone nicht abschließend bestätigt. Es wurde keine angebliche Live-Vorschau gerendert.

**Historische Genauigkeit:** Die lichte Raumgeometrie ist weiterhin eine Näherung aus Le Rouges Zeichnung von 1776; sie ist keine zentimetergenaue Bauaufnahme. Die V3.2-Änderungen betreffen ausschließlich die bewusst ergänzte Dachgeometrie.
