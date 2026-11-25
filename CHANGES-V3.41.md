# V3.41 – Phase 6: Gesamtkontrolle

Basis: V3.40. Alle baulichen Geometrien, Materialdefinitionen und Texturen unverändert. Zwei Bedienungs-/Ansichtskorrekturen:
- Grundrissansicht: horizontale Schnittebene bei 2,70 m über dem jeweiligen Fußboden statt unmittelbar unter der nächsten Geschossdecke. EG 3,78 m, OG 9,48 m absolute Modellhöhe. Dadurch werden die Decken über den Räumen ausgeblendet, statt die Draufsicht zu verdecken.
- Lauf-/Blickeingaben, Tastenzustand, Joystick und Pinch-Zustand werden beim Ansichtswechsel, Fenster-Fokusverlust und Ausblenden der Seite zurückgesetzt. Kein zusätzlicher Licht- oder Möbelaufbau.

## Neuer Gesamtprüfbericht
`chateau/docs/ROISSY-V3.41-COMPLETE-QA.json` enthält Ergebnisse je Raumzone, Materialflächen und Dachfenster. 18 EG-Zonen und 20 begehbare OG-Zonen sind auf dem 10-cm-Raster bei geöffnet angenommenen Türen innerhalb des jeweiligen Geschosses vollständig zusammenhängend (185.989 erreichbare Rasterpositionen insgesamt). Die zusätzliche OG-Zone über dem Salon ist korrekt nicht begehbar. 909 Stichproben der Bodenauflage und vertikalen Kopffreiheit anhand der statischen Boxen und registrierten Oberflächen ohne Befund; kleinste so ermittelte Kopffreiheit 3,301 m. 269 Bodenfinish-Rechtecke: keine gegenseitigen Flächenüberlappungen, kein Eingriff in OG-Öffnungen. 840 Meshes ohne nicht-endliche Positionswerte.

20 Dach-/Attikafenster: 320 lokale Sichtstrahlen aus beiden Richtungen ohne opake Hindernisse im getesteten 1-m-Bereich um die Scheiben (V3.40, unveränderte Geometrie). Kein Nachweis freier Sicht durch den gesamten Dachraum.

## Regressionen
11 vorhandene Tests auf der finalen V3.41 erfolgreich erneut ausgeführt: Innen- und Eingangstüren, Türfugen, Haupttreppe, Westflur und Perron, statische Oberflächen, Raumfarben, Kuppel, repräsentative und Hallendecken, Fenster. Die bisherigen detaillierten V3.40-Fenstertests wurden nicht vollständig erneut ausgeführt; deren Geometrie blieb unverändert.

Neuer Test: `node --experimental-default-type=module tests/audit-complete-v341.mjs` (vollständiger lokaler Dachfenstertest; `--skip-roof` für schnellere Wiederholung). Kein Browser-/Safari-Sichttest, keine Bildratenmessung. Rasterprüfung simuliert offene Türen, tatsächliche automatische Türbewegungen separat in Regressionstests. Kopffreiheitsstichproben berücksichtigen statische Boxen und die registrierte Kuppel, nicht jedes frei modellierte Ornament. Kein Nachweis historischer Zentimetergenauigkeit. Die als Escalier secondaire bezeichnete EG-Zone ist ein Raum, keine zusätzlich rekonstruierte begehbare Nebentreppe. Das Dachgeschoss ist kein begehbares Geschoss.
