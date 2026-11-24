# Château Grand Roissy V3.20 – Treppenwand & Hallenkuppel

Basis V3.19; Grundriss, Außenfassade, Treppengeometrie, Böden, Navigation und Beleuchtung bleiben erhalten. Schwerpunkt dieser Version sind zwei gezielte Architekturkorrekturen aus dem iPhone-Rundgang: die falsche Tür an der westlichen Treppenwand und der bisher nur grafisch angedeutete Deckenmittelpunkt der Halle.

## Änderungen
- Die störende EG-Tür an der westlichen Innenwand des Grand escalier (Achse x≈-13,21) wurde entfernt. Die Öffnung ist wieder als durchgehende Wand mit Sockel, Wandfeld, Profilierung und oberem Abschluss hergestellt.
- Der Hallenbereich erhält im Obergeschoss keine bloß flache Kreiszeichnung mehr, sondern eine echte flach gespannte Vestibülkuppel / Kuppelkalotte mit umlaufenden Stuckringen.
- Die Vestibüldecke im OG wurde um die Kuppel herum neu geordnet; der zentrale Bereich ist für die räumliche Kalotte reserviert, während die umgebenden Felder und Profile erhalten bleiben.
- Keine neuen Leuchten, keine Möbel und keine Änderung an Außenhülle oder Treppenlauf.

## Prüfung
- Syntaxprüfung der aktiven JS-Module erfolgreich.
- Innenraum-, Flächen-, Treppen-, Fassaden- und Öffnungstests erfolgreich.
- Zusätzliche Prüfung: die entfernte Tür existiert nicht mehr in `interiorDoorways`, die Vestibülkuppel ist als 3D-Mesh vorhanden.
- Browsernavigation im Testsystem weiterhin blockiert; daher keine visuelle Endfreigabe auf iPhone/Safari.

## Installation
ZIP komplett entpacken, Inhalt in die Wurzel des bestehenden GitHub-Repositories kopieren und vorhandene Dateien ersetzen. Aufruf `?v=roissy320`, Anzeige `ROISSY · V3.20`.
