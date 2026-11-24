# Prüfbericht Château Grand Roissy V3.8

## Ausgangslage

Der V3.7-Test prüfte die 44 Innentüren hauptsächlich anhand einer etwas verkleinerten Durchgangsbreite. Er überprüfte jedoch noch nicht unabhängig die seitlichen Fensteröffnungen gegen alle raumtrennenden Wandstücke.

## Neu entdeckte und behobene Probleme

- **Fenster/Wand-Konflikt:** Mehrere Seitenfenster, insbesondere an der Westfassade, liegen bei den früheren Achsen auf den Enden historischer Raumtrennwände. Die neuen Fensterachsen und die schlankere Öffnungsbreite liegen zwischen diesen Wänden.
- **Tür-Wand-Konflikte im EG:** Die strengere Prüfung über die nahezu gesamte lichte Durchgangsbreite fand zwei weitere Fehler bei `x = -13.26 m` und `x = +20.46 m`, jeweils am bisherigen Türzentrum `z = 5.30 m`. Beide Zentren wurden auf `z = 5.75 m` gelegt.
- **Türlaibungen:** Tief in die Räume ragende Zierkörper durch schlanke, beidseitige Leibungsprofile ersetzt; lichte Höhe weiterhin 2,80 m.

## Reproduzierbare Tests

`test-v38-partitions-fenestration.mjs` prüft 53 Fensterpositionen über EG/OG (ohne Erdgeschoss-Eingangstüren) und 44 vollständige Durchgangskerne auf Überschneidungen mit realen InstancedMesh-Bauteilen. Ergebnis: **0 physische Fenster-/Türüberschneidungen im definierten Prüfbereich**.

Zusätzlich wurden die vorherigen Regressionstests ausgeführt:

- `test-v37-openings.mjs`: 44/44 freie Innentüröffnungen
- `test-building-qa.mjs`: 18/18 EG-Räume, 20/20 begehbare OG-Bereiche erreichbar; 7 Außentreppenstufen entsprechen der Laufsteuerung
- `test-model.mjs`: durchgehender Weg Park → Vestibül → 1. OG → EG und Rückweg über die Haupttreppe
- `test-v36-vestibule.mjs`: Bodenmaterial-/Gebälk- und Portikusprüfungen

## Grenzen

Prüfung des 3D-Baukörpers anhand der Modellgeometrie, kein aktueller iPhone-Safari-Sichttest. Lichte Maße der historischen Öffnungen und Positionen sind nur teilweise aus Originalquellen ableitbar; Abweichungen sind als Rekonstruktion zu verstehen. Dies ist kein Zertifikat, dass jede Wand- oder Dachfuge des Schlosses visuell perfekt ist.
