# V3.39 – Phase 4: Türen und Laibungen

Basis V3.38. 43 Innentüren und 3 Außenportale erhalten versetzte Drehachsen und neue feste/mitdrehende Scharnierbänder. Innenzargen reichen durch die 312 mm tiefe Laibung, neue Anschläge verdecken die durch den Drehachsenversatz entstandene Fuge. Die Flügel sind entsprechend schmaler, Maueröffnungen bleiben gleich. Innenbeschläge mit gerundeten Messinggriffen, Rosetten, Befestigungspunkten und dunkler Schlüsselöffnung; horizontaler Holzfaserverlauf bei Querfriesen. Außenportale behalten Glas, Oberlicht, Eisenornamente und Eichenfinish; ihre Anschläge und Flügelhöhen sind angepasst. Eine zusätzliche Kollisionsabfrage schützt bei automatischem Schließen der Außenportale. Keine Änderung an Boden-, Wand- oder Deckenentwürfen, keine Leuchten oder Möbel.

## Technische Prüfungen
- `validate-door-detail-v339.mjs`: 43 Innentüren mit 258 Bandpositionen; 23.137.440 geprüfte bewegte Eckpunkte über 19 Posen pro Mesh (wiederverwendete Geometrie berücksichtigt), mindestens 15 mm Abstand zur Hauptzarge bei diesen Stichproben. Außenportale: 3.046.080 Eckpunktprüfungen, mindestens 20 mm Abstand zum Hauptpfosten. Absichtliche Anschlagkontakte und Scharnierverbindungen sind keine Teile dieses Abstandschecks. Kein kontinuierlicher exakter Festkörper-Kollisionstest.
- `validate-door-gaps-v330.mjs`: 34.776 Strahlen, 0 ungetroffene Strahlen an den geprüften geschlossenen Fugen.
- `validate-interior-doors-v330.mjs`: 2.924 simulierte Bewegungsschritte, 0 blockierte Durchgänge oder gemeldete Schwenkkollisionen.
- `validate-portals-v321.mjs`: 336 Bewegungsschritte, Öffnen/Schließen erfolgreich.
- Regression: Treppenweg (1.020 Schritte), Fenster (146 Sichtstrahlen), Wandprofile, Oberflächen, Westflügel/Perron, Kuppel und Decken V3.36–V3.38 bestanden.
- Die Tests laufen ohne echten Browserrenderer. Keine visuelle oder iPhone-Performance-Freigabe. Beschläge sind historisch inspiriert, keine dokumentierten Roissy-Originale.
