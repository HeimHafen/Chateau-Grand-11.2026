# V3.21 – Französische Eichenportale
Basis: vollständiges V3.20-Archiv. Alle drei vorhandenen Rundbogenportale der Hoffassade erhalten neue Türen innerhalb der bestehenden Steinöffnungen (Hauptportal 1,98 m, Seitenportale 1,52 m breit, Gesamthöhe 3,90 m).
- Sechs automatisch bewegte Eichenflügel mit beidseitig modellierten profilierten unteren Füllungen, verglasten oberen Feldern, S-förmigen Schmiedeeisenelementen und Messinggriffen.
- Feststehende halbkreisförmige Oberlichter mit radialen Eisenstreben und Bogenrahmen. Mittleres Portal mit zusätzlichen ovalen Holzornamenten.
- Materialgruppen je Türflügel zusammengefasst; insgesamt 45 Meshes und 63.313 Dreiecke für die drei Portale. Prozedurale Holzmaserung, keine fotografischen Materialscans.
- Öffnen nach innen bis 90 Grad, Schließen automatisch. Kollisionsprüfung folgt den rotierenden Flügeln. Keine Änderungen an Grundriss, Fassade, Treppe, Kuppel oder Beleuchtung.
- Historisch inspirierter Entwurf, nicht als belegte Originaltür ausgegeben.

Tests: `node --experimental-default-type=module tests/validate-portals-v321.mjs` (336 Durchgangsschritte, sechs Flügel, Öffnen/Schließen), `tests/validate-exterior-v313.mjs`, `tests/validate-interior-v320.mjs`, `tests/validate-stair-v310.mjs`, `tests/validate-surfaces-v314.mjs` mit demselben Node-Befehl. Syntax der aktiven Module geprüft. Kein visuelles Safari-/WebGL-Rendering oder FPS-Test durchgeführt. Frühere V3.20-Innenarchitektur wurde nicht weiter überarbeitet.
