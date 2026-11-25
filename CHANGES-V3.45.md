# V3.45 – Grand Escalier · Lichtkunst

- Zwei Kronleuchter mit 27 und 30 Kerzen, facettierten Kristallen, Ketten, vergoldeten Bronzeprofilen und zwei Armkränzen. Untere Aufhängung auf bestehender Galerierose, obere auf die tatsächliche zentrale Rosettenachse verschoben.
- Sieben dreiflammige Wandleuchten (vier EG, drei OG), mit modellierten Akanthusblättern, Rückplatten, geschwungenen Armen und Kristallpendeln. Wandfeldmitten aus bestehenden Segmenten berechnet.
- Neun kurze warmweiße Lichtquellen, von der tatsächlichen Leuchtenposition abgeleitet, keine zusätzlichen Schattenpässe. Insgesamt 78 modellierte Kerzen.
- Treppe, Grundriss, Marmor, Türen und Möbelstand unverändert.

## Tests
`node --experimental-default-type=module tests/validate-lights-v345.mjs`: 7 Wandbefestigungen, 2 Deckenbefestigungen durch Strahlenprüfung gegen die 3D-Geometrie, 972 Hüllquader-Abstandsprüfungen entlang der Treppenläufe. `tests/validate-stair-v310.mjs`: 1020 Bewegungsschritte, Hin- und Rückweg bestanden. 170384 Dreiecke für die neun Leuchten insgesamt. Keine Safari- oder FPS-Freigabe. Positionen und Leuchtenformen sind eine Eigenentwicklung nach der Bildvorlage.
