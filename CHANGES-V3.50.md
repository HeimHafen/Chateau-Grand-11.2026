# ROISSY V3.50 – Boden, Sichtbarkeit und Rundgang

Basis: vollständiges Repository ROISSY V3.49. Aufnahme `ScreenRecording_11-25-2026 16-37-15_1.mp4`, 19,33 Sekunden, zeigt V3.49 im Treppensaal und der Antichambre. Auffällig ist der auf Entfernung teilweise durchsichtige Teppich, der beim Näherkommen wieder sichtbar wird, sowie sehr ausgeprägte Bodenreflexionen. Die genaue GPU-Ursache ist nicht direkt messbar.

## Änderungen
- Die separate transparente, tiefenversetzte Marmor-Spiegelungsfläche und der zusätzliche Renderpass sind aus dem aktiven Programm entfernt. Die ältere Implementierung bleibt als nicht eingebundene Referenz erhalten. Der reale Marmorboden verwendet weiterhin die vorhandenen Texturen, Normal-/Rauheitsmaps und die Umgebungsreflexion des PBR-Materials. Der Boden wird weniger spiegelnd erscheinen als V3.49; keine exakte Raumspiegelung mehr.
- Kein negativer Polygon-Depth-Bias bei den geometrisch getrennten Stein- und Parkettoberflächen. Teppich explizit undurchsichtig, mit aktiviertem Tiefentest/-schreiben; um 6 mm angehoben, um seine Unterseite deutlicher vom Boden zu trennen. Keine Änderung der Teppichposition in X/Z oder des Designs.
- Rundgang: Kamera-Tiefenbereich von 0,24–850 m auf 0,16–240 m, näherer Sichtbereich mit günstigerem Verhältnis von Fern- zu Nahdistanz; Außen-Übersicht unverändert. Die vorhandene Himmelskugel hat Radius 188 m und folgt der Kamera.
- Laufgeschwindigkeit innen 2,75 m/s, außen 4,2 m/s statt 6,1 m/s überall. Kollisionsprüfungen mit maximal 5,5 cm Schrittweite, kreisförmiger Joystick mit Totzone. Schutz am rückwärtigen Treppenpodest passend zum sichtbaren Geländer. Raumbezogener Bedienhinweis.
- Cache-/Versionskennung `roissy350`. Bestehende Architektur, Fenster, Wandfarben, Leuchten und Möbel bleiben erhalten; keine neuen Modelle installiert.

## Prüfungen (tatsächlich ausgeführt)
`node --experimental-default-type=module tests/<Datei>.mjs`
- validate-floor-occlusion-v350: 45 CPU-Strahltests, zwei reale undurchsichtige Marmor-Meshes, kein aktiver Spiegelpass, Podestschutz und freier Transfer.
- validate-stair-v347: 1020 Bewegungsschritte; Auf-/Abstieg ohne Teleport; keine Tür-, Seitenfenster- oder Deckenausschnitt-Kollisionen gemäß Test.
- validate-furnishings-v346: bestehendes Mobiliar, Bodenkontakt und Wand-/Deckenkollisionen gemäß Test.
- validate-interior-doors-v330: bestehende Türdurchgänge.
- validate-surfaces-v314: Flächenprüfung.
- JavaScript-Syntaxprüfung für main, architecture, navigation, furnishings.

## Offene Abnahme
Browserprüfung mit Chromium scheitert an ERR_BLOCKED_BY_ADMINISTRATOR für die lokale Projekt-URL. CPU-Geometrieprüfungen sind kein Ersatz für den visuellen WebGL-/Safari-Test. Teppichdarstellung aus der ursprünglichen Kameraposition, Bodenwirkung, Geländer und Bewegungsgefühl müssen auf dem iPhone bestätigt werden. Keine Garantie, dass sämtliche Grafikfehler beseitigt sind. Die separat gesammelten GLB-Modelle wurden in dieser Version weder eingebaut noch optimiert.
