# V3.30 – Wandanschlüsse und Hofperron

Basis: vollständiges Paket V3.29. Die zusätzliche Querwand im westlichen Obergeschoss verlief mitten durch die Antichambre (aile ouest) und teilte den Raum in zwei kurze Zellen. Entfernt wurde ausschließlich der westliche Abschnitt dieser Querwand einschließlich seiner Tür. Die westliche Längswand wurde über beide Raumreihen auf x=-22,022 m ausgerichtet; zwei angenäherte Raumregister-Rechtecke wurden entsprechend korrigiert. Die beiden in V3.29 verbreiterten Türen behalten nun ein einheitliches Rohbaumaß von 1,80 m. Alle 13 sekundären Querwände beider Geschosse schließen auf den tatsächlichen Längswandachsen ab.

Hofperron: zusätzliche Aufsatzstreifen aus V3.29 und überstehende Stufennasen entfernt; durchgehende Kalksteinterrasse und sieben volle, bündig anschließende Stufenfelder mit vorhandener metrischer Kalksteintextur. Terrassenkante und Navigationsgrenze liegen exakt an der ersten Stufe. Die oberste Stufe liegt auf der Terrassenhöhe; die übrigen Stufen fallen gleichmäßig ab.

Keine Änderung an der inneren Haupttreppe, Fenstern, Eingangsportalen, Beleuchtung oder Möblierung. Grundrisskorrektur ist eine Modellinterpretation des hinterlegten Raumregisters, kein gesichertes Originalaufmaß.

## Prüfungen
- validate-west-perron-v330: 336 freie Punkte in der Antichambre; 18 innere sekundäre Wandanschlüsse; 664 Bewegungsschritte im Westflügel hin und zurück mit automatischen Türen; 72 Geometrie-Höhenprüfungen mittels Sichtstrahl an Außentreppe und Terrasse mit Navigation abgeglichen.
- audit-plan-walls-v311: 62 untersuchte Raumgrenzen, 60 modelliert, 2 bewusst offene Treppenanschlüsse; keine fehlende Trennwand nach diesem Prüfverfahren.
- validate-interior-doors-v330: 43 Innentüren, 2924 Durchgangsschritte, keine blockierten Durchgänge oder statischen Schwenkkonflikte.
- validate-door-gaps-v330: 34776 geprüfte Fugenstrahlen an 46 Türen, keine offenen Prüfpunkte.
- validate-stair-v310: 1020 Schritte, Haupttreppe hin und zurück.
- validate-windows-v323: 146 freie Glas-Sichtstrahlen.
- validate-portals-v321: 336 Durchgangsschritte an den Eingängen.
- validate-exterior-v313 und validate-surfaces-v314 erfolgreich.

Keine visuelle WebGL-/Safari-Endprüfung in dieser Version. Die konkreten Screenshot-Kamerakoordinaten sind nicht bekannt.
