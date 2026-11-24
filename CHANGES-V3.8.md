# V3.8 – Innenwand- und Türlaibungsabgleich

Ausgangsbasis: Roissy V3.7 (vollständiges MaxGame-Palastprojekt).

**Änderungen**

1. Alle vier Fensterachsen der Seitenfassaden neu auf `z = -8.70, -5.75, 6.55, 9.35` gestellt, konstruktive Fensterbreite 1,65 m. Die Fassadenachsen beider Etagen sind gleich; kollidierende Raumtrennungen werden vermieden.
2. Sämtliche 44 inneren Türlaibungen auf beidseitige flache Architrave, dünne steinerne Leibungsflächen und 2,80 m lichte Höhe geändert. Der Querschnitt der Wand bleibt 0,31 m.
3. EG bei den Trennwänden `x = -13.26` sowie `x = +20.46`: Durchgang von `z = 5.30` nach `z = 5.75`, weil der alte Türbereich querlaufende Wandstücke schnitt.
4. Zur Laufzeit ausgeführte Prüfung der tatsächlichen Modellboxen gegen den lichten Kern aller Innentüren und der kollisionsbasierten Raumtrennwände gegen Seitenfenster hinzugefügt.
5. Version V3.8 und Cache-Busting für gemeinsame Grundrissdatei, 3D-Modell und Navigation.

**Nicht verändert:** EG/OG-Raumregister (18/21), Haupteingang, Treppen, Salon-Luftraum, Vestibülboden, Dach und Kuppel. Die Fenstermaße sind funktional abgestimmte Rekonstruktionsmaße, keine behaupteten Originalmaße.
