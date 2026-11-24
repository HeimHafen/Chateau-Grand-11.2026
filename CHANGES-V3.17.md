# Château Grand Roissy V3.17 – Raumbezogene Materialveredelung

V3.16 als Basis; Außenhülle, historisch angenäherte Raumachsen, Treppenmaße und Navigation bleiben erhalten. Keine neuen Leuchten oder Innenlichtquellen. Globale Beleuchtung unverändert gegenüber V3.16.

- Vestibül und Grand Escalier: fein texturierter heller Kalkstein, Steinoberflächen an Stufen und Podesten; oberer Galerieboden erhält eigenen Steinbelag.
- Salons: heller warmer Elfenbeinton, Boiserie, Eichen-Tafelparkett. Private Räume: zurückhaltendes Salbeigrau und matteres Parkett. Durchgänge/Nebenräume: Sandton und Kalkputz, Steinböden.
- Stuckdecken: feine Materialkarten, keine Eigenemission. Innenwand- und Deckenboxen erhalten metrische UVs auch an beschnittenen Flächen, statt Texturen je Bauteil zu strecken.
- Vorhandene Projekttexturen werden wiederverwendet. Sechs neue JPG-Karten für Putz und lackierte Oberflächen wurden aus vorhandener Steintextur abgeleitet; keine neuen externen Materialscans. Die beiden Parkettvarianten verwenden dieselbe bestehende Tafelparkett-Textur mit unterschiedlichen Farb- und Rauheitsparametern. Historisch inspirierte Gestaltung, keine nachgewiesenen Originaloberflächen.
- Startfehler in main.js V3.16 (verbliebener Teil der entfernten Innenlichtfunktion) korrigiert.

## Prüfung
Node-Syntaxprüfung der aktiven JS-Dateien; Innenraum-, Flächen-, Treppen-, Außenhüllen- und Öffnungstests erfolgreich. 45 Türen, 73 Fensterpositionen, 139 neue/übernommene Bodenrechtecke, 34 materialisierte Raumzonen, 50 Deckenfelder, 0 Innenlaternen, 1020 Treppenschritte in der Simulation. Keine Überschneidungen der geprüften gleichgerichteten koplanaren Boxflächen oder Bodenfelder. Die browserbasierte Sichtprüfung wurde von der Umgebung blockiert (ERR_BLOCKED_BY_ADMINISTRATOR); keine visuelle oder iPhone-Performance-Freigabe.

## Installation
ZIP entpacken, Inhalt auf Repository-Wurzelebene ersetzen, Commit/Push. Aufruf `?v=roissy317`, Anzeige `ROISSY · V3.17`.
