# CHÂTEAU GRAND – MAXGAME PALAST 2.2: ROISSY EG + 1. OG

**Spielbare 3D-Weiterentwicklung** auf Basis des bestehenden MaxGame-Palasts 2.1. Es wurden die beiden historischen Geschossgrundrisse des Château de Roissy als echte 3D-Innenwände, Türen, Räume, Treppen und Galerien im 224 m langen Haupttrakt modelliert. Die bisherige Außenhülle, der Portikus, Dachpavillons, Innenhof und Materialien bleiben erhalten.

## Installation für GitHub Pages / Working Copy

1. ZIP entpacken.
2. **Alle enthaltenen Dateien und Ordner direkt in das Repository-Hauptverzeichnis von `Chateau-Grand-2027` kopieren.** Gleichnamige Dateien ersetzen. Keinen neuen Oberordner hochladen.
3. In Working Copy `Commit → Push` ausführen. GitHub Pages muss auf Branch `main`, Ordner `/(root)` stehen.
4. GitHub-Pages-Adresse mit `?v=palast22` öffnen. Oben rechts erscheint `MAXGAME-PALAST · 2.2`.

## Bedienung

- **EG · Grundriss**: Dach und obere Geschosse werden für die Plankontrolle ausgeblendet. Die Raumbezeichnungen erscheinen direkt auf den 3D-Fußböden.
- **1. OG · Grundriss**: Ansicht der historischen Beletage mit offenem Bereich über dem Grand Salon und offener Haupttreppe.
- Nach der Grundrissansicht **„EG betreten“ / „1. OG betreten“** wählen. Dann beginnt der Rundgang auf der gewählten Geschosshöhe innerhalb des Corps de Logis. Links ziehen = bewegen, rechts wischen = umsehen.
- **Front**, **Perspektive**, **Überblick**, **Eingang**, **Treppe Seite**, **Zurücksetzen** erhalten das normale vollständige Außenmodell.
- Alle normalen Fassadenfenster, Dachgauben und acht Glasabschnitte je Kuppeltambour sind jetzt **in beide Blickrichtungen transparent**. Hinter den Glasscheiben liegen keine dunklen opaken Kulissen mehr. Der tatsächliche Blick kann naturgemäß durch Innenwände und Decken begrenzt sein.

## Historische Vorlage und Umsetzung

Das Nutzerbild zeigt zwei Pläne, die im 1776 von Le Rouge veröffentlichten Druck über das Château de Roissy vorliegen. Im EG sind u. a. Salon, Vestibule, Grand Escalier, Salle à manger, Chambre de parade, Cabinet de musique, Chambre à coucher, Antichambres, Lingerie und Servicebereiche erkennbar. Das 1. OG zeigt mehrere Chambres, Antichambres, Garderoben und das als `Salon du Rez-de-Chaussée` bezeichnete Raumvolumen. Dieser Bereich wurde **als doppelhoher Salon mit freier Öffnung im Obergeschoss** umgesetzt.

Diese historische Vorlage bildet die Anordnung und die Raumfolgen des Haupttrakts, ist aber **keine Maßzeichnung für das 224 m breite Fantasieschloss**. Die historischen Proportionen wurden deshalb maßstäblich auf die größere Hülle übertragen; kleinere Kabinette und Verkehrsflächen sind teilweise zu handhabbaren Räumen zusammengefasst. Keine Behauptung über eine millimetergenaue Rekonstruktion.

**Wo die Pläne wirken:** 15 Raumzonen im Erdgeschoss und 17 Raumzonen im ersten Obergeschoss des **Hauptgebäudes**. Die Seitenflügel und der rückwärtige Quertrakt sind äußerlich unverändert; dort wurde keine zusätzliche historische Raumaufteilung erfunden. Sonstige Geschosse bleiben im Stand 2.1.

**Quellen:** Rijksmuseum, Inventar RP-P-1964-1846; Bibliothèque nationale de France, historische Gravur (1776); frei zugängliche Reproduktion auf Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Plan_du_Premier_Etage_du_Chateau_de_Roissy_;_Plan_du_Rez-de-Chauss%C3%A9e_du_Chateau_de_Roissy_-_estampe_-_non_identifi%C3%A9_-_btv1b100258916.jpg

## Technische Prüfung

- Die aktive Architektur `chateau/architecture.js` wurde mit der echten Three.js-Bibliothek und dem originalen MaxGame-GLB aus `assets/white-house-structure.glb` erfolgreich ausgeführt.
- **15 EG-Zonen**, **17 1.-OG-Zonen**, **992 Fenster-Pane-Instanzen**; **0** undurchsichtige Fenster-Rückwände; **0** nicht endliche Geometriewerte in der geprüften Modellstruktur.
- Die echte MaxGame-Säulenkonstruktion bleibt mit **17 unmittelbaren Portikus-Baugruppen** enthalten.
- Bei Browser-Geschossansichten wird GPU-Clipping eingesetzt, sodass Dächer und obere Baukörper ausgeblendet werden, ohne das Gebäude dauerhaft zu verändern.
- **Wichtige Testgrenze:** Die reale Ausführung in iPhone-Safari konnte hier nicht kontrolliert werden; im lokalen Testbrowser sind localhost-Seiten administrativ gesperrt. Die vollständige 3D-Modelllogik wurde hingegen unabhängig ausgeführt.
- **Begrenzung:** Die Haupttreppe ist als modellierte Stufenfolge mit Deckenaussparung vorhanden; der Rundgang teleportiert beim Geschosswechsel an den richtigen Startpunkt. Automatisches Höhersteigen auf Stufen und komplett möblierte Innenräume sind noch nicht implementiert.

Siehe `chateau/docs/ROISSY-RAUMREGISTER-V2.2.json` für Raumnamen, Lage und Maßstabsraster.
