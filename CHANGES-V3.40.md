# V3.40 – Phase 5: Fensterarchitektur

Basis: V3.39. Fensterpositionen, Maueröffnungen, Grundriss, Türen, Böden und Decken bleiben geometrisch unverändert. Historisch inspirierte Detailgestaltung, keine belegte Rekonstruktion der ursprünglichen Fensterbeschläge.

- Alle 93 Fenster (73 Fassade, 20 Dachbereich) erhalten beidseitig feinere Glasfalz- und Sprossenprofile: 690 umlaufende Profilabschnitte und 1.160 Sprossenprofilabschnitte.
- Fassadenfenster erhalten durchgehende Kalksteinlaibungen, gestufte Fensterbänke und einen zusätzlichen Innenrahmen. Steintexturen werden metrisch skaliert.
- Modellierte Messinggriffe, Espagnolette-Stangen und Scharnierkörper an allen 73 Fassadenfenstern. Runde Beschlaggeometrien in einem gemeinsamen Mesh zusammengefasst.
- Fensterholz bleibt warmes Anthrazit. Klare, leicht getönte Einzelflächenverglasung ohne deckende Doppelglasflächen; Materialopazität 0,095. Fenster bleiben feststehend.

## Geometrieprüfung (Node.js, Three.js)

- 1.168 horizontale Strahlen durch die rechteckigen Felder der 73 Fassadenfenster aus beiden Richtungen: keine opaken Hindernisse in den geprüften Strahlen.
- 73 vertikale Fensterbankprüfungen: Oberseite bündig mit der unteren Öffnungskante.
- 146 zusätzliche Durchsichtprüfungen aus V3.23 bestanden.
- 43 Innentüren, drei Eingangsportale, 34.776 Türfugenstrahlen, 2.924 Innentür- und 336 Portaldurchgangsschritte sowie 1.020 Haupttreppenschritte erfolgreich geprüft.
- Regressionen für Kuppel, Stuckdecken, Westflur, Außenstufen und statische Boxflächen bestanden; keine verbleibenden geprüften koplanaren Überlappungen bei statischen Boxflächen.
- Kein visueller WebGL-/Safari-Test und keine Bildratenmessung; Dachfenster wurden hinsichtlich Anzahl, Profilen und Materialparametern geprüft, nicht auf vollständige Durchsicht durch den Dachaufbau.

Neuer Test: `node --experimental-default-type=module tests/validate-window-detail-v340.mjs`.
