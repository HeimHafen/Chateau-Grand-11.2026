# V3.47 – Vergrößerter Grand Escalier

Basis V3.46. Bewusste gestalterische Abweichung vom historischen Plan: westliche Trennwand vor und hinter dem Treppenhaus auf beiden Geschossen von ungefähr x=-13.21 m nach x=-17.65 m versetzt. Lichte nominelle Raumbreite (Raumregister) 10.392 statt 5.904 m, rund 76 % größer. Die zugehörigen westlichen Nebenräume sind entsprechend schmaler; Querwände, Anschlüsse und Öffnungen wurden angepasst. Außenfassade und Geschosshöhen bleiben unverändert. Der hintere offene Vorraum bleibt Teil der zusammenhängenden Raumfolge; der zentrale Vestibülraum ist weiterhin separat.

- Luftraum von 6.41 auf 8.63 m Rohbaubreite vergrößert, neue durchgehende Westgalerie mit etwa 2.25 m nominaler Breite, schmiedeeisernem Geländer, Handlauf und profilierter Deckenkante. Originale U-Treppenläufe und 36 Stufen erhalten.
- Neue Deckeneinfassung, neu zentrierte obere Rosette und oberer Kronleuchter; unterer Kronleuchter und Rosette unter die rückwärtige Galerie vor der Sitzgruppe versetzt. Wandleuchten folgen der neuen Wandachse.
- Vorhandenes Mobiliar neu arrangiert: Sitzgruppe zwischen den rückwärtigen Fenstern, Teppich in der erweiterten freien Fläche neben der Treppe, Konsole und Spiegel an der neuen Westwand; Pflanzvasen, Bank und übrige Dekoration versetzt. Die Ostdurchgangstür bleibt frei. Marmorspiegelungen jetzt auch im erweiterten Bereich aktiviert.
- Neue Treppenhaus-Startposition in der breiten Zone.

## Prüfung
- validate-expanded-hall-v347.mjs: 104 Decken-/Luftraumprüfungen, 52 Geländer-Kollisionsprüfungen, 564 Schritte entlang neuer Raum- und Galeriewege.
- validate-stair-v347.mjs: 1.020 Schritte auf und ab; 36 Stufen.
- validate-interior-doors-v330.mjs: 43 Türen, 2.924 Durchgangsschritte, keine blockierten Prüfrouten.
- validate-lights-v347.mjs: 7 Wand- und 2 Deckenbefestigungen, 972 Abstandsprüfungen.
- validate-furnishings-v346.mjs: 14 Gruppen, keine gemeldeten Kollisionen mit statischer Geometrie.
- audit-complete-v341.mjs --skip-roof: 38 erreichbare Raumzonen, 907 Boden-/Kopffreiheitspunkte, keine geprüften Bodenüberlappungen oder Bodenflächen im Luftraum. Dachfenster wurden nicht erneut geprüft.

Die Fotosimulation ist eine Stilvorlage, keine vermessene Architekturzeichnung. Eine exakte 1:1-Pixelübereinstimmung wird nicht behauptet; die U-Treppe, bestehende Fassadenfenster, zwei Geschosse und selbst erstellten V3.46-Möbel bleiben bestehen. iPhone-Safari und Bildrate nicht verifiziert. Historische Prüfskripte vor V3.47 enthalten teilweise alte Koordinaten/Anzahlen; die neuen V3.47-Skripte verwenden die neue Geometrie.
