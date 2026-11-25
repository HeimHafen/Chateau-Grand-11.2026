# V3.42 – Referenz-Ausbau und Konstruktionskorrektur

Basis: V3.41. Ziel: die fotografisch wirkende Treppenhaus-Referenz des Nutzers mit echter, begehbarer 3D-Geometrie annähern, keine Bildkulisse.

- Fassadenbänder an allen drei Hofportalen unterbrochen; offene Archivolte ohne unteres Querprofil. 63 geometrische Sichtstrahlen an den früher blockierten Höhen geprüft.
- Bodenflächen und Raumzuordnung an den konstruierten Wandachsen neu berechnet, statt unabhängige ungefähre Raumrechtecke einzulegen. 48 zusammengefasste Raumregionen, 74 Bodenrechtecke; Hallensteinfläche separat wie bisher. 66 Materialzuordnungsprüfungen bestanden. Bestehende offene Treppen-/Gartenvorhalle EG nun durchgehend Kalkstein. Keine Bodenflächenüberlappungen, keine Flächen in den OG-Lufträumen.
- 9 neue, lokal erzeugte PBR-Texturen (Eiche, Tafelparkett, Kalkstein; je Farbe, Normalen, Rauheit; 1536 × 1536). Keine fotografischen Originalmaterialien. Alte dunkle Holzrandstreifen an den Raumkanten entfallen. Unterschiedliche Parkett- und Steinarten bleiben erhalten.
- Wandflächen anhand der gebauten Raumachsen farblich zugeordnet; Wandfelder an tatsächlichen Querwänden getrennt, Sockelanschlüsse erhalten. Alte doppelte, abschnittsweise Gesimsleisten entfernt; schlichte Deckenfelder am gebauten Raumatlas ausgerichtet.
- Treppenuntersichten, Podestuntersicht, untere Wandvertäfelungen und erster Setzstufenanschluss neu profiliert. Haupttreppengeometrie und Bewegungslogik der 36 Stufen erhalten. Zwei Kristallleuchter und vier Wandleuchter plastisch modelliert; wegen niedriger Zwischenpodesthöhe sitzt der untere größere Leuchter in der angrenzenden Garten-Antichambre. Keine weiteren Möbel. Zwei Leuchten mit dezentem statischem Licht.
- Helleres Tageslicht, schmalerer Schattenbereich, lokale Umgebungsreflexion und optionales Laden der vorhandenen instanzierten Ahornmodelle im Park. Räume bleiben begehbar. Keine iPhone-FPS-Zusage.
- Ortsanzeige nutzt dieselbe Raumzuordnung wie Boden und Wände, Innenraum hat Vorrang vor Terrasse.

## Prüfungen
Geometrie-/Navigationstests in Node; Ergebnisse unter chateau/docs/ROISSY-V3.42-*.json. Neu: tests/validate-reference-v342.mjs. Raumprüfung: 38 begehbare Zonen, 909 analytische Boden-/Kopffreiheitspunkte, keine überlappenden Bodenflächen; Dachfenstertest dieser Runde ausgelassen. Haupttreppe: 1.020 Bewegungsproben. Portale: 336 Bewegungsproben. Fassadenfenster: 1.168 Sichtstrahlen und 73 Fensterbankprüfungen (vor dem letzten Wandfeld-Zuschnitt). Lokaler Chromium-Browsertest wurde durch ERR_BLOCKED_BY_ADMINISTRATOR blockiert. Keine optisch bestätigte 1:1-Übereinstimmung, keine echte iPhone-Leistungsprüfung; Referenzbild zeigt eine idealisierte Architektur, deren Maße/Beleuchtung und Perspektive aus dem Einzelbild nicht exakt rekonstruierbar sind.
