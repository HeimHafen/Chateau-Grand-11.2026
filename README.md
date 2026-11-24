# CHÂTEAU GRAND ROISSY V3.13 – Historische Außenarchitektur

Komplettes Austauschpaket auf Basis V3.12. Aktive Laufzeit: index.html, chateau/main.js, chateau/architecture.js, chateau/roissy-config.js, chateau/navigation.js.

## Quellen
- Le Rouge, 1776, drittes Heft, Tafel 10 (Grundrisse), Tafel 12 (Hof- und Parkfassade): https://agorha.inha.fr/ark:/54721/3e0c51c5-191f-4850-b43f-0c00e44b3fd5
- Historische Fassaden: https://commons.wikimedia.org/wiki/File:Roissy-en-France_-_Chateau_de_Roissy_-_Facades_principales.jpg
- Archäologischer Kontext: https://actu-culture.com/archeologie/chambord-revelations-de-larcheologie-7-7-roissy-metamorphose-dun-chateau-dile-de-france/
- Grundriss: https://www.rijksmuseum.nl/nl/collectie/object/Plattegronden-van-de-begane-grond-en-eerste-verdieping-van-het-kasteel-Roissy--5df618ecbc2ebfe72eff689a21d509b4

## Umsetzung
- Zwei echte Hofpavillons (5,05 m Vorsprung), flacher parkseitiger Mittelrisalit (0,80 m Vorsprung). 12 reale Fassadenabschnitte, Bodenplatten und Kollisionen an neuer Hülle; alte Außenwände in den Erweiterungen entfernt.
- 13 Hauptachsen pro Hof- und Parkfassade, Rundbogenfenster in Mittelzone, drei automatische Eichentüren mit Oberlicht, Pilaster, Eckquader und Gesimse.
- Historische Dreiecksgiebel, modellierte stilisierte Reliefs, Mittelattika mit Fenstern, Schieferdach mit Gauben, sechs Schornsteine. Kuppel und White-House-Portikus aus aktivem Modell entfernt.
- Hofterrasse mit sieben Stufen, Hof- und Parkansicht im Menü.
- Bestehende Innenstruktur, Treppenanlage und Vestibülboden erhalten; Trennwände der Seitenflügel bis zur neuen Außenwand verlängert.

## Tests, erfolgreich ausgeführt
- `node tests/validate-exterior-v313.mjs` (12 Fassadenabschnitte, 13+13 Achsen, 260 Schritte durch Eingang ohne Türsimulationskörper, neue Flügel begehbar, endliche Mesh-Transformationen)
- `node test-v313-openings.mjs` (73 modellierte Fensterpositionen und 45 Innentüren gegen Trennwände und Türöffnungen geprüft; keine festgestellten Konflikte)
- `node test-building-qa.mjs` (38 historische Raumzonen erreichbar, sieben Außenstufen)
- `node tests/validate-stair-v310.mjs` (1020 Laufwegproben auf Haupttreppe)
- `node tests/audit-plan-walls-v311.mjs` (56 Mauerwerksanschlüsse)
- Node Syntaxchecks aller aktiven Module. Alte versionsspezifische Tests sind Archivmaterial und erwarten teilweise die alte rechteckige Hülle bzw. den entfernten Portikus.

## Grenzen
Keine visuelle WebGL-Freigabe: lokaler Chromium-Aufruf scheiterte an ERR_BLOCKED_BY_ADMINISTRATOR. Safari/iPhone nicht getestet. Die historischen Aufrisse und die sichtbare Grundrissstaffelung sind Referenz, jedoch keine lückenlose Vermessung. Um die begehbare Innenstruktur zu erhalten, wurde der alte 54 × 23 m Kern erweitert (54 × 28,85 m neue angenäherte Hauptabmessungen). Das ist keine nachgewiesene historische Gesamttiefe. Fensterachsen wurden zur Konfliktfreiheit mit bestehenden Trennwänden angepasst. Die Giebelreliefs, Materialien, Höhen, Seitenfenster und Dachdetails sind interpretierte Rekonstruktionen. Nebengebäude, Nebentreppen und genaue Raumabmessungen der Flügel sind noch nicht rekonstruiert. Dachübergänge und alle visuellen Materialdetails müssen noch im Live-Browser überprüft werden. Alte Vorschau.jpg zeigt nicht den neuen Stand.

## Installation
ZIP entpacken, Inhalt direkt im vorhandenen Repository ersetzen, Commit/Push. GitHub Pages mit `?v=roissy313` laden. Oben rechts muss ROISSY · V3.13 erscheinen. Hof/Park auswählen, für freien Rundgang Erkunden wählen.
