# V3.43 – Grand Escalier, Referenz-Feinschliff

Basis V3.42. Nur die Haupttreppe und ihre unmittelbare Galerie, Beleuchtung und Materialwirkung weiterentwickelt.

- Drei verbreiterte, an den Vorderkanten abgerundete Antrittstufen: 3,07 / 2,93 / 2,80 m, anschließend 2,67 m. Stufenhöhen, Achsen, 36 Steigungen und die U-förmige Haupttreppe bleiben erhalten. Die Navigation berücksichtigt die verbreiterte Unterstützung konservativ (abgerundete äußere Eckbereiche ausgenommen).
- Zwei geschlossene extrudierte Steinkerne mit abgestufter Oberseite und geneigter Unterseite statt getrennt wirkender Unterplatten; feinere, durchgehende profilierte Wangen und Untersichtsrahmen. Keine Änderung des Grundrisses.
- Längliche schmiedeeiserne Ovale (68 in den Treppenläufen), Messingmanschetten, seidenmatt polierter Holzhandlauf; bestehende Geländerachsen erhalten.
- Sechs Profilbänder an den beiden Galeriekanten, gefasste Galerieuntersicht und Rosette unter der festen oberen Deckenplatte. Der untere Kronleuchter ist aus der Garten-Antichambre unter die vordere Galerie verlegt; dichter modellierte Kristallketten an beiden Leuchtern, wärmere lokale Lichtwirkung. Die vier Wandleuchter bleiben erhalten.
- Glattere Oberfläche des geschliffenen Kalksteinbodens im Treppenhaus und angrenzender Garten-Antichambre; vorhandene Texturen weiterverwendet. Keine zusätzlichen Möbel.

## Prüfungen
`tests/validate-stair-reference-v343.mjs`: 108 Stufenoberflächen- und Navigationshöhenprüfungen, 36 Untersichtsstrahlen, 6 Strahlen auf verbreiterte Stufenschultern; 2 geschlossene Steinkerne, 6 Galerieprofilbänder, 4,10 m Freiraum unter dem unteren Leuchter. `tests/validate-stair-v310.mjs`: 1020 simulierte Auf-/Abstiegsschritte. `tests/validate-reference-v342.mjs`: 63 Portalstrahlen, 66 Bodenmaterialprüfungen, keine vom statischen Flächenbereiniger gemeldeten Restüberlappungen. JSON-Berichte unter chateau/docs. Der ergänzende Fenstertest wurde wegen Zeitlimits nicht abgeschlossen. Keine visuelle Safari- oder WebGL-Endkontrolle; keine bestätigte pixelgenaue Übereinstimmung mit dem idealisierten Referenzbild. Die ursprüngliche U-Treppe kann nicht ohne Grundrissänderung exakt die Perspektive und Proportionen der Referenz einnehmen.
