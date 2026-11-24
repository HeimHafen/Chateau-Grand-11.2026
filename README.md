# Château Grand 2027 – ROISSY V3.10

**Vollständiges, spielbares Three.js-/MaxGame-Projekt für GitHub Pages.** Grundlage: Roissy V3.9, historischer EG- und 1.-OG-Grundriss nach Le Rouge (1776) – die Maße sind aus der Zeichnung geschätzt, nicht zentimetergenau nachgewiesen.

## V3.10: Nur das Grand Escalier weiterentwickelt

- 36 echte, begehbare Kalkstein-Stufen in zwei Läufen mit konstant etwa 15,83 cm Steigung (die Laufsteuerung verwendet dieselben Maße).
- Zwei zusammenhängende steinerne Treppenuntersichten statt frei sichtbarer Trittplatten.
- Vier anschließende seitliche Treppenprofile (Wangen), passend zu beiden Steigungen.
- Durchgehende schmiedeeiserne Baluster und obere Handläufe aus gewachstem Nussbaumholz. Die Baluster stehen auf den tatsächlichen Stufen; die Geländer bleiben außerhalb der mittleren Gehbahn.
- Geländer am Zwischenpodest und am oberen Treppenabsatz mit gefassten Endpfosten.
- Leichtere, dünnere Stufenkanten statt grober heller Querbalken.
- Unverändert: Historische Zimmerachsen, 18 EG-Zonen, 21 OG-Zonen einschließlich Salon-Luftraum, Außenfassade, Fenster, Türen, Vestibülboden, Kuppel und Zugang vom Garten.

**Die Geländergestaltung ist historisch plausibel, aber nicht als originaler Roissy-Bestand nachgewiesen.**

## Installation mit Working Copy

1. ZIP vollständig entpacken.
2. Die `index.html` und alle Ordner direkt in die oberste Ebene des bestehenden Repositories `Chateau-Grand-2027` kopieren – **keinen zusätzlichen Unterordner** anlegen.
3. Bestehende Dateien ersetzen, **Commit → Push** durchführen.
4. Bereits veröffentlichte GitHub-Pages-Spieladresse mit `?v=roissy310` öffnen (oder an eine vorhandene URL `&v=roissy310` anhängen). Die Versionsanzeige muss **ROISSY · V3.10** lauten.

## Validierung

Der reproduzierbare 3D-Objektaufbau kann lokal ohne WebGL und ohne Donor-GLB geprüft werden:

```bash
node --experimental-default-type=module tests/validate-stair-v310.mjs
```

Der Test nutzt ein namesgleiches Leichtgewichts-Stand-in für die MaxGame-Portikusteile. Er validiert die erzeugte Treppenhausgeometrie, Zimmerzonen, Türen, Öffnungen und 3D-Koordinaten. **Er ist kein Ersatz für den visuellen WebGL-/iPhone-Safari-Test.** Siehe `PRUEFBERICHT-V3.10.md`.

Die bisherigen Entwicklungsstände und Quellen-Dateien bleiben im Paket erhalten.
