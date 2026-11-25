# V3.48 – Einrichtung Schritt 1: GLB-Sitzgruppe (Importvorbereitung)

Basis V3.47. Nur Sitzgruppe im Grand Escalier / rückwärtigen Vorraum bearbeitet. Sofa und zwei Beistelltische näher zur rückwärtigen Wand verschoben und symmetrisch auf gleicher Z-Achse positioniert. Tischlampen separat modelliert/gruppiert, damit sie beim Austausch des Tischmodells bestehen bleiben und an die importierte Tischhöhe angepasst werden. Andere Räume, Architektur und Leuchten unverändert.

## Originalmodelle
- Modenese Rococo cream sofa: https://sketchfab.com/3d-models/rococo-cream-sofa-by-modenese-6a6a5b1a970d4636b35cc51552a61c7d
- Modenese Timeless round side table: https://sketchfab.com/3d-models/timeless-round-side-table-by-modenese-952699f3eec146318b163b9bd9ed72e1
- Alternativer Sofakandidat (anderer Stil, CC0): https://polyhaven.com/a/Sofa_01

Die eigentlichen Originaldateien konnten in dieser Umgebung nicht heruntergeladen werden und sind NICHT Bestandteil des Pakets. Keine Originalmöbel integriert. Originaldateien über reguläre Downloadfunktion beziehen, Lizenz und Urheberangabe vor Veröffentlichung prüfen. Keine erfundenen Ersatzdateien.

Im Startbildschirm können zwei selbstenthaltende GLB-Dateien lokal gewählt werden; der Ersatz gilt nur für diese Sitzung. Für dauerhaften Einsatz GLB als `assets/models/seating/sofa.glb` bzw. `table.glb` speichern und `?v=roissy348&models=1` aufrufen. Das Modell wird proportional in den vorhandenen Kollisionsbereich eingepasst. Modelle müssen Y-up sein und beim Sofa mit der Vorderseite nach +Z ausgerichtet sein. Ohne Datei oder bei Ladefehler bleibt das bisherige Möbel sichtbar. Komprimierte GLB mit erforderlichem Draco/Meshopt/BasisU-Decoder sind nicht unterstützt. Die beiden importierten Tische teilen das gleiche Modell. Lampenhöhen werden angepasst, aber die Tischplatte muss nach dem Import visuell auf korrekte Auflage geprüft werden.

## Geprüft
- `validate-model-import-v348.mjs`: synthetische GLB-Prüfdatei mit 12 Dreiecken; tatsächliches Dekodieren, proportionaler Fit, Bodenanschluss, eine Sofa-/zwei Tischinstanzen, Sichtbarkeit und Ablehnung ungültiger GLB-Datei. KEIN Test der Originalmöbel.
- `validate-furnishings-v346.mjs`: 16 Gruppen (zwei getrennte Tischlampen), 10 solide Gruppen, 466 Wand- und 8 Deckprüfungen, keine gemeldeten Überschneidungen.
- `validate-interior-doors-v330.mjs`: 2.924 Durchgangsschritte, keine blockierten Prüfrouten.
- `validate-stair-v347.mjs`: Auf-/Abstieg bestanden.
- Keine visuelle Browser-/iPhone-Endkontrolle; Originaldateien und deren Material-/Geometriequalität noch nicht geprüft.
