# Qualitätsprüfung – Château Grand Roissy V3.10

## Umfang

Nur **Grand Escalier**: 36 Stufen, zwei Treppenläufe, Zwischen- und OG-Podest, Handläufe, Baluster, Treppenuntersichten, seitliche Abschlüsse. Historischer Grundriss, Raumregister und Außenhülle unverändert.

## Tatsächlich ausgeführte Tests

- Dreidimensionaler Three.js-Szenenaufbau mit nachgebildeten, **namesgleichen** GLB-Portikusbauteilen (nicht als echter GLB-Import auszugeben): erfolgreich.
- 394 Mesh-/InstancedMesh-Objekte im gesamten modellierten Testaufbau, **0 ungültige Geometrien** (NaN/Infinity).
- 36 begehbare Stufen; Steigung `(6,78 − 1,08)/36 = 0,15833 m`.
- Zwei zusammenhängende steinerne Untersichten, vier seitliche Treppenprofile, vier Handläufe sowie 54 Balusterpositionen und acht gefasste Endpfosten erzeugt.
- Zwei Treppenpodeste bleiben auf den korrekten Höhen 3,93 und 6,78 m.
- Mindestbreite der Gehbahn nach dem verwendeten Geländerprofil: **2,17 m** (rechnerisches Modellmaß, kein baurechtlicher Nachweis).
- Reproduzierbarer Bewegungsregressionstest: **1.020 kurze, aufeinanderfolgende Gehpunkte** vom EG über beide Flüge ins OG und vollständig zurück – ohne Teleportation und ohne blockierten Schritt.
- Geometrieprüfungen der bisherigen Bereiche weiterhin bestanden: **0 blockierte Innentüröffnungen**, **0 Fenster-/Wandkollisionen**, **0 Flächenüberdeckungen in den Salon-/Treppenlufträumen**, 18 EG- und 21 OG-Raumzonen unverändert.

Rohdaten: `chateau/docs/ROISSY-V3.10-TREPPENHAUS-QA.json`.

## Grenzen / noch nicht bestätigt

**Kein tatsächlicher WebGL-Bildvergleich in iPhone Safari**. Der Test nutzt statt des vollständigen MaxGame-Portikus-GLB leichte gleichnamige Ersatzgeometrie; die reale Anlage des GLB ist aus V3.9 unverändert. Die Geländergestaltung ist historisch plausibel, aber **nicht** anhand einer gesicherten Originalaufnahme des Château de Roissy rekonstruiert. Kein Nachweis historischer Zentimetergenauigkeit oder vollständiger optischer Perfektion des gesamten Gebäudes.

## Test erneut ausführen

`node --experimental-default-type=module tests/validate-stair-v310.mjs`
