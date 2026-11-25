# V3.44 – Grand Escalier, Marmor und Licht
Basis V3.43. Die unmöblierte Bildvorlage dient als gestalterisches Ziel; keine Änderung der historischen Raumstruktur oder der U-Treppe.

- Neue lokal erzeugte Marmor-PBR-Texturen (1536 × 1536), 80-cm-Platten mit kleinen dunklen Diamanteinlagen und durchgehendem 16-cm-Randfries im EG-Treppenhaus. Der Fries ersetzt Teilflächen des Belags auf derselben Höhe; keine zusätzliche Stufe.
- Optionale perspektivisch berechnete Raumreflexion auf dem Marmor im EG, niedrige Renderauflösung auf Mobilgeräten und gedrosselte Aktualisierung. Abschaltbar mit `?v=roissy344&reflect=0`. Die Shader-Ausgabe konnte hier nicht visuell geprüft werden.
- Zwei Kronleuchter mit jeweils 24 Kerzen, größeren Kristallkaskaden und zusätzlicher Lichtwirkung; vier vorhandene Wandleuchter mit lokalen Lichtquellen.
- Größere Galerieovale mit Messingakzenten, Zahnfries und modellierter mittiger Muschelornamentik, größere Galerie-Deckenrosette, schwarze Treppenpfosten mit Messingbändern.
- Keine Möbel. Bestehende Stufenhöhen, Grundriss, Türen, Fenster und Navigation erhalten.

## Prüfung
`tests/validate-reference-v344.mjs`: vier Friesabschnitte, 97 Paarprüfungen der Marmorflächen, unveränderte EG-Abdeckung, Spiegelkamera und Rücksetzung des Renderzustands mit simuliertem Renderer. `tests/validate-stair-reference-v343.mjs`: 108 Stufen-, 36 Kernuntersichts- und 6 Schulterprüfungen. `tests/validate-stair-v310.mjs`: 1020 Bewegungsschritte. `tests/validate-reference-v342.mjs`: 63 Portalstrahlen und 78 Materialprüfungen. Browserzugriff durch ERR_BLOCKED_BY_ADMINISTRATOR blockiert; keine GPU-, Shader-, Safari- oder FPS-Freigabe. Keine bestätigte 1:1-Übereinstimmung mit der gerenderten Referenz; Proportionen und Treppenverlauf bleiben diejenigen des vorhandenen begehbaren Schlossmodells.
