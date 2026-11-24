# Detaillierte technische Prüfung – CHÂTEAU GRAND ROISSY V3.7

**Prüfbasis:** Originalpaket V3.6 und der neu eingesandte iPhone-Screenshot „1. Obergeschoss · Chambre à coucher“.

## Am Screenshot erkennbar (nur Sichtbefund)

- Eine breite, unruhig erscheinende senkrechte Türlaibung an einer Wandkreuzung
- Schwer lesbarer oberer Türabschluss, der optisch in den Deckenrand übergeht
- Mehrere unmittelbar aufeinanderfolgende Wand- und Türrahmen ohne einheitliche Detaillierung
- Nur schlichte Durchgangsrahmen statt ausgearbeiteter historischer Innentüren

Der Screenshot allein verrät **nicht eindeutig**, welche der mehrfach so bezeichneten Chambres à coucher gezeigt wird. Daher dürfen die folgenden zwei nachgewiesenen Fehler nicht ohne Weiteres exakt dieser einen Tür zugeordnet werden.

## Quellcode- und Geometrieaudit

| Teil | V3.6-Befund | V3.7-Status |
|---|---|---|
| Türzug EG West, x = −21,93 m | Querwand schränkt Durchgang um ~13,5 cm ein | Türzentrum z 5,30 → 7,30 m |
| Türzug 1. OG Ost, x = 20,46 m | Querwand schränkt Durchgang um ~7,5 cm ein | Türzentrum z 5,30 → 7,30 m |
| Türstürze innen | unterer Rand bei +2,70 m | Unterkante bei +2,80 m |
| Innentüren gesamt | Bisher nur auf Erreichbarkeit, nicht auf 3D-Körperfreiraum getestet | **44/44** lichte Durchgänge ohne Kollisionen im getesteten zentralen Freiraum |
| Außentüren | 3 bewegliche Doppeltüren | Unverändert |
| EG | 18 historische Raumzonen | 18/18 im Kollisionsmodell erreichbar |
| 1. OG | 21 Einträge, 1 davon Salon-Luftraum | 20/20 begehbare Zonen erreichbar |
| Haupterschließung | 36 Treppenstufen + 7 Außentreppenstufen | Höhenregressionstest bestanden |

**Prüfmethode:** Die Testdatei `test-v37-openings.mjs` extrahiert die realen InstancedMesh-Transformationsmatrizen aller Innenwände, Stürze und Laibungen aus Three.js. Für jedes Türzentrum wird eine zentrale freie Durchgangsfläche von etwa 2,70 m Höhe geometrisch gegen alle massiven Wand- und Rahmenbauteile geprüft. Das ist ein stärkerer Nachweis als ein allgemeiner Raum-Erreichbarkeitstest, aber **kein vollständiger visueller Nachweis**.

## Weiterhin ausdrücklich offen

1. **Genaue optische Türqualität:** Leibungsdetails, Schattenartefakte, Fugen und Materialien auf Safari nicht visuell überprüft.
2. **Historische Maßgenauigkeit:** Die Türpositionen sind Rekonstruktionsmaße nach Plan, keine archäologisch zentimetergenau belegten Türanschläge.
3. **Türblätter innen:** Anders als die drei Haupteingänge besitzen die 44 Innentüröffnungen noch keine separat animierten Türblätter.
4. **Jede Fenster- und Dachfuge:** Die hier erfolgte Prüfung konzentriert sich auf das Tür-/Wandsystem; Dach, Kuppel und Verglasung wurden nicht erneut vollständig optisch nachgeprüft.
5. **Browsergrafik:** Chromium kann in dieser Umgebung keinen WebGL-Kontext initialisieren; iPhone-Safari kann hier nicht ausgeführt werden.

## Wiederholbare Tests

```bash
node test-v37-openings.mjs
node test-model.mjs
node test-building-qa.mjs
node test-v36-vestibule.mjs
```

**Urteil:** V3.7 beseitigt zwei objektiv nachgewiesene Wanddurchdringungen und einen systematischen Sturzfehler. Es ist **keine Bestätigung der Perfektion des gesamten Gebäudes**.
