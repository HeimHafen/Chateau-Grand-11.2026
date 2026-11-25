# V3.49 – Technische Qualitätsbasis vor der Einrichtung

Basis: bereitgestelltes Château-Grand-11.2026-main.zip, V3.48. Keine neuen Möbel, keine Veränderungen an Grundriss, statischer Geometrie, Leuchtenpositionen oder bestehender Ausstattung. Die 23 separat bereitgestellten Modellarchive bleiben unverändert und wurden nicht integriert.

## Verbesserungen
- Gemeinsame Texturinstanzen für identische Außenmaterial-Maps und Wiederholungsparameter, statt mehrfacher gleichartiger Texturallokation.
- Start wartet auf die registrierten lokalen Ressourcen (maximal 15 s; Warnung bei erkannten Ladefehlern). Laufzeitdiagnose über `window.__CHATEAU_MAXGAME.renderDiagnostics()` und `missingAssets`.
- Automatische Renderauflösung anhand des Medians der Framezeiten, mit Hysterese; feste Detail-/Flüssig-Option. Die optionale Spiegelung entfällt bei niedriger Renderauflösung. Kein FPS-Versprechen ohne reales Gerät.
- Schatten der beweglichen Eingangstüren werden bei Änderungen aktualisiert, zeitlich begrenzt. Spiegelung darf die anstehende Schattenaktualisierung nicht vor dem Hauptbild verbrauchen. Innentüren bleiben wie vorher ohne eigenen Schattenwurf.
- Hintergrundpause, Rückkehr aus ausgeblendeten Tabs, WebGL-Kontextverlust/-wiederherstellung mit Hinweis und Eingaberücksetzung. Pfeiltasten auch seitwärts, Tastaturfelder nicht abgefangen.
- Scrollbare, Safe-Area-taugliche Menüs, 44 px Mindesthöhe für Ansichtsbuttons, zweispaltiges Menü im flachen Querformat, scrollbarer Startdialog.
- Versions-/Cachekennung `roissy349`. Keine zusätzlichen externen Bibliotheken.

## Reproduzierbare Prüfungen
Alle folgenden Node-Tests liefen erfolgreich: `validate-expanded-hall-v347`, `validate-stair-v347`, `validate-interior-doors-v330`, `validate-lights-v347`, `validate-furnishings-v346`, `validate-model-import-v348` (synthetische GLB), `validate-surfaces-v314`, `audit-complete-v341` (inkl. Dachfenster). Syntaxprüfung der geänderten JS-Dateien. Ausführungsbefehl: `node --experimental-default-type=module tests/<Name>.mjs`.

## Grenzen / offene Abnahme
Chromium verweigerte die lokale Projekt-URL mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Kein tatsächlicher Live-Render oder iPhone-Safari-Test möglich; Grafikqualität, FPS, UI im Gerätebrowser und Kontextwiederherstellung sind nicht visuell abgenommen. Ein zusätzlicher separater Fenstertest `validate-window-detail-v340` wurde wegen Zeitlimit nicht abgeschlossen; die vollständige Geometrieprüfung inklusive 20 Dachfenstern war erfolgreich. Historische Maße sind weiterhin Rekonstruktionsmaße; V3.47 vergrößerte den Grand Escalier bewusst abweichend vom historischen Plan. Keine Behauptung einer 1:1-Rekonstruktion oder fotorealistischen Endabnahme.
