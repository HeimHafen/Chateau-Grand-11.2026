# V3.36 – Phase 3.1: Deckenflächen, Gesimse und sichtbare Kuppel

Basis V3.35. Die Decken von 27 schlichteren Räumen erhalten auf die tatsächliche Geschossdecke zugeschnittene Stuckfelder und abgestufte Profile. 2.493 Gesimsstücke folgen den vorhandenen Wandflächen und werden gegen die reale Decke beschnitten; je Profilstufe sind ihre Grundflächen überschneidungsfrei. Die bestehenden repräsentativen Deckenreliefs bleiben erhalten.

## Kuppel
Der bisherige massive Dachgeschossboden verdeckte die oberhalb angeordnete Kalotte. Jetzt gibt es eine 3,48 × 3,20 m große Aussparung ausschließlich im Dachgeschossboden zwischen den Hallenbalken. Die elliptische Kalotte mit 0,84 m Stichhöhe und geschlossenen Zwickeln bildet einen sichtbaren oberen Raumabschluss. Die Dachform bleibt gleich. Diese Lösung ist eine historisch inspirierte Rekonstruktion, kein belegter Originalbefund. Keine Beleuchtung, keine Möbel.

## Prüfung
`tests/validate-ceilings-v336.mjs`: 69 aufwärts gerichtete Sichtstrahlen treffen die Kalotte, 12 Eckproben prüfen die Zwickel, 3.043 Deckenreliefrechtecke sind durch Geschossdecken gestützt. 50 Deckenfelder insgesamt, 27 davon neu ausgestaltet. Weiterhin 43 Innentüren; 2.924 simulierte Türdurchgänge, 34.776 Fugenstrahlen, 1.020 Treppenschritte, 146 freie Fenstersichtstrahlen. Westflügel- und Oberflächentests bestanden, keine verbleibenden geprüften koplanaren Überlappungen. Bodenquellcode, Grundriss- und Türmodule identisch mit V3.35. Syntax geprüft. Headless-Geometrieprüfung, keine visuelle Safari-/iPhone-Freigabe und kein FPS-Nachweis.
