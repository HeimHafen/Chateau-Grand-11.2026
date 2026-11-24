# Qualitätsprüfung – Château Grand Roissy V3.6

## Gezielte Bauteilprüfungen

- **Original MaxGame-GLB:** Tatsächliche Giebelgeometrie im GLB überprüft. Nach der Transformation liegen die rückwärtigen Giebelpunkte bei ungefähr **z = 11,91 m**, außerhalb der vorderen Fassadenaußenkante bei **z = 11,73 m**. In V3.5 lag der Giebel rückwärtig bei ungefähr z = 10,07 m und ragte damit in das 1. OG.
- **Eckquader:** Die Steine sind jetzt als Außenverblendung konstruiert, nicht mehr auf der Innenseite der Eckzimmer.
- **Vestibül:** Der neue PBR-Kalksteinboden liegt **8 mm über der tragenden EG-Platte** bei x = −6,175 … +6,175 m, z = −1,62 … +10,64 m. Das ist eine auf den Plan abgestimmte (nicht historisch bestätigte) Fußbodenverlegung.
- **Plattenmuster:** 3 Bildmaterialien (Albedo, Normal, Rauigkeit), im Browser wiedergegeben mit einem einzigen Bodenmesh. Einfassung bündig, 6 Textur-/Fußboden-Friese und Sockel unterbrochen an seitlichen Durchgängen.
- **Raumregister:** 18 EG-Zonen / 21 OG-Einträge (davon ein Salon-Luftraum), keine zusätzliche Erfindung von Zimmern.
- **Begehbarkeit:** Bestehender Test vom Eingang zum Salon über die Westtreppe zum 1. OG sowie der Abstieg zurück bestanden. 18/18 EG-Räume und 20/20 begehbare OG-Bereiche im 25-cm-Raster erreichbar.
- **Dateistruktur:** Index im Archiv-Root, neue Bildmaterialien unter `assets/interior`, neues JavaScript unter `chateau/`, alte Engine und GLB enthalten.

## Was weiterhin offen ist

- Die Außenansicht und das tatsächliche PBR-Material wurden **nicht auf iPhone Safari** visuell bestätigt.
- Die exakten originalen Innenraumhöhen, Balkondetails und Fenstermaße sind anhand des verfügbaren historischen Materials nicht zentimetergenau belegt.
- Die dekorative große Kuppel und der große MaxGame-Portikus sind **kreative Erweiterungen**, keine archäologisch bestätigten Roissy-Bauteile.
- Die geometrische Verbesserung an Portikus, Eckquadern und Vestibül ersetzt keine vollständige bauhistorische Rekonstruktion sämtlicher Räume.

## Reproduzierbare Tests

`node test-model.mjs`, `node test-building-qa.mjs`, `node test-v36-vestibule.mjs`. Browser nur mit statischem Webserver/GitHub Pages öffnen; nicht direkt als `file://`-Dokument.
