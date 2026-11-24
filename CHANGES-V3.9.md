# ROISSY V3.9 – Geschossdecken und saubere Wandanschlüsse

**Basis:** vollständiges V3.8-Projekt. Historischer Le-Rouge-Grundriss, Hauptbau 54 × 23 m, 18 Räume/Zonen im EG und 20 begehbare Bereiche plus Salon-Luftraum im OG erhalten.

## Bauarbeiten

1. **Boden- und Deckenkanten an den Außenwänden geschlossen:** Die bisherigen rechteckigen Platten endeten innen rund 5 cm vor den Seitenwänden und 9 cm vor der vorderen/hinteren Mauerfläche. V3.9 führt alle drei horizontalen Platten nun 3 cm in die Außenmauern hinein. So entstehen an den Wandfüßen keine sichtbaren Öffnungen zur Rasenfläche.
2. **Salon- und Treppenhaus-Luftraum erhalten:** Die obere Geschossplatte wird weiterhin um den historischen doppelgeschossigen Salon und die seitliche Haupttreppe ausgeschnitten. Keine zweite Decke oder unsichtbare Brücke in den Luftraum eingefügt.
3. **Offene Deckenränder abgeschlossen:** Acht schmale, tragend verankerte Naturstein-Faszien an den tatsächlichen Schnittkanten der OG-Decke eingebaut. Keine frei schwebenden Balken und keine Überbrückung des freien Raums.
4. **Wand-/Deckenanschlüsse in EG und OG:** Kleine Abschlussprofile nur auf massiven, vorhandenen Innenwandabschnitten beidseitig angesetzt; sie stoppen vor jeder Türöffnung.
5. **Neuer automatischer Geometriecheck** `test-v39-ceiling-shell.mjs` misst die Mauerüberdeckung, erkennt Deckeneintritte in beide Lufträume und prüft die real ausgegebenen Deckenelemente.

## Nicht geändert

Außenfassaden, MaxGame-Portikus, Fensterachsen, 44 Innentüröffnungen, historisches Raumregister, Dach, Kuppel, alle Treppenstufen und freier Rundgang. Diese Version ist bewusst **ein** systematischer Bauabschnitt, kein behaupteter fotorealistischer Gesamtabschluss.

## Prüfung

- Wandüberdeckung im Modell: 3,0 cm an allen vier Außenwänden.
- 8 neue Deckenrandsegmente, keine OG-Deckenfläche im Salon- oder Treppenluftraum.
- Basisprüfungen EG/OG-Begehbarkeit, 44 Türen, 53 Fenstertestpositionen, Treppenauf-/abstieg bestanden.
- Ein direkter iPhone-Safari-Test und eine fotorealistische visuelle Endabnahme sind nicht möglich gewesen.
