# Château Grand Roissy – V3.14: Z-Fighting-Korrektur

## Änderungen gegenüber V3.13
- Statische, gleich ausgerichtete koplanare Boxflächen werden vor dem Rendering exakt aufgeteilt. Überdeckte Rechteckteile werden entfernt, sichtbare Teile behalten Lage, Normalen und UVs. Materialprioritäten sichern Bodenbeläge und Zierprofile vor dem Mauerwerk. Keine globale Verschiebung von Wänden oder Kollisionskörpern.
- Die Geschossdecken verwenden eine disjunkte Vereinigung der Kern- und Flügelgrundflächen. Die Treppen- und Salonöffnungen bleiben frei. Die Terrassenplatte liegt oberhalb des Fundaments, nicht auf einer identischen Deckfläche.
- Der Vestibülboden und seine Intarsien besitzen zusätzlich kleine, lokale Tiefen-Offsets. Keine unnötigen Gras-Doppelflächen im Außenbereich.
- Kamera-Tiefenbereich verbessert: Nahgrenze 0,24 m im Rundgang, distanzabhängig in der Übersicht; Ferngrenze 850 m statt 1600 m. Schattenkamera umfasst die Gebäudeposition, normalBias angepasst; statische Schattenkarte 2048 px. Gras-Normalmap etwas reduziert.
- Grundriss, Fassade, Fenster, Türöffnungen und Bewegungslogik von V3.13 erhalten. Die Versions-URLs aller aktiven Chateau-Module sind auf roissy314 aktualisiert.

## Prüfungen
- 4.319 statische Boxbauteile, 2.883 beschnittene Flächen, 1.322 betroffene Bauteile, 0 verbleibende gleichgerichtete koplanare Rechtecküberschneidungen innerhalb der geprüften Boxgruppen; Glas aus der Prüfung ausgeschlossen.
- 21.778 neu erzeugte Dreiecke auf Normalenausrichtung und Degeneration geprüft.
- Obergeschossplatten ohne Flächenüberschneidungen, 45 Innentüren und 73 Außenfenster geprüft; keine Öffnungskollisionen.
- 1.020 kontinuierliche Bewegungsschritte auf der Haupttreppe (auf und ab), 260 Eingangsschritte, Flügelfußböden und Kollisionsgrenzen erfolgreich geprüft.
- Tests: `node --experimental-default-type=module tests/validate-surfaces-v314.mjs`, `tests/validate-exterior-v313.mjs`, `tests/validate-stair-v310.mjs`, `test-v313-openings.mjs` (jeweils mit demselben Node-Befehl).
- Einschränkung: Chromium blockiert lokale HTTP- und file-URLs (ERR_BLOCKED_BY_ADMINISTRATOR). Kein tatsächlicher Safari/iPhone-WebGL-Sichttest möglich. Nicht alle beliebig orientierten Modellflächen sind durch die Boxflächenprüfung erfasst. Eine vollständige visuelle Flackerfreiheit kann erst im Browser bestätigt werden.

## Installation
Gesamten ZIP-Inhalt in die Wurzel des bestehenden GitHub-Repositories kopieren, Dateien ersetzen, committen und pushen. Startseite mit `?v=roissy314` laden. Erwartete Anzeige: `ROISSY · V3.14`.
