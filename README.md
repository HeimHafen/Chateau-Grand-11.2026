# CHÂTEAU GRAND – ROISSY V3.1.1 – STARTFIX

**Behebung des Startabbruchs auf iPhone Safari:** Der Quellcode von V3.1 versuchte beim Aufruf der Außenansicht auf `#locationStatus` zuzugreifen, das im HTML fehlte. Es fehlten auch `#walkStick` und `#stickKnob` für den mobilen Rundgang. In V3.1.1 sind die benötigten Elemente jetzt im HTML vorhanden und die Zugriffe im JavaScript gegen einen fehlenden DOM-Knoten abgesichert.

Unverändert: Roissy-Grundriss von EG und 1. OG, 3D-Modell, Innenwände, Treppen, historische Größenannahmen, automatische Eichentüren, Fenster und alle Grafikassets.

## Installation

1. ZIP entpacken. **Inhalt direkt** in das Hauptverzeichnis des vorhandenen GitHub-Pages-Repositorys kopieren, sodass `index.html` im Root liegt.
2. Vorhandene Dateien ersetzen, **insbesondere** `index.html` und `chateau/main.js`.
3. In Working Copy **Commit → Push**.
4. Die vorhandene Spieladresse mit `?v=roissy311` aufrufen (bei einer bestehenden Query-Zeile `&v=roissy311`).
5. Erwartete Anzeige oben rechts: **ROISSY · V3.1.1**. Nach dem Laden wird „Château erkunden“ aktiv.

## Prüfung

Die DOM-IDs und JavaScript-Syntax wurden getestet. Das ZIP ist vollständig und fehlerfrei entpackbar. Ein echter Test auf deinem iPhone konnte hier nicht durchgeführt werden. Dies ist **ein gezielter Laufzeit-Hotfix**, keine neue Stufe der historischen Architektur.

---

## V3.1-Dokumentation

# CHÂTEAU GRAND — ROISSY V3.1 · HISTORISCHER GRUNDRISS

Spielbares Three.js-Projekt aus der V3.0-Quelle. Schwerpunkt dieser Revision: **Raumaufteilung und Zimmermaße anhand der erhaltenen Pläne von Le Rouge (1776), die grundsätzlich dem 1703–1709 errichteten Schloss entsprechen.**

**Kein Einrichtungsprojekt.** Keine Möbel, keine Innendekoration. Maßgeblich sind historische Raumbezeichnungen, Raumzonen, Wände, Durchgänge, Salon-Luftraum, seitliches Grand Escalier, Fenster- und Türpositionen.

## Was geändert wurde

- Die bisherigen Raumangaben wurden von *Wandachsen-/Buchtmaßen* zu näherungsweisen **lichten Raummaßen** umgestellt; nominelle 46 cm Wandstärke abgezogen. Dies ist eine technische Näherung, keine archäologisch gesicherte Zimmervermessung.
- Der massive **2,86 m hohe Vollquader in Innen-Türdurchgängen** wurde entfernt. Der Rahmen besitzt jetzt nur noch Türpfosten und Sturz, der Durchgang bleibt optisch frei.
- Versions- und Forschungsdokumentation aktualisiert; die Pläne wurden mit ihrer ursprünglichen Jahreszahl 1776 gekennzeichnet.
- Durchgehende Begehbarkeit sowie der ursprüngliche MaxGame-Portikus bleiben erhalten. Portikus und Kuppel sind **bewusste kreative Ergänzungen**, nicht historisch für Roissy belegt.

## Quellen

Die Bauphase liegt ungefähr zwischen 1703 und 1709. Der Stich von 1776 zeigt den nachweislich gebauten Grundkörper; der ältere imposante U-förmige Entwurf von Tessin ist **nicht ausgeführt** worden. Ein gesicherter Ausführungsgrundriss von 1708 oder 1730 liegt uns nicht vor. In `chateau/docs/ROISSY-HISTORISCHER-GRUNDRISS-V3.1.json` sind Quellen und die Grenzen unserer metrischen Schätzung dokumentiert.

## Upload

Archivinhalt direkt ins GitHub-Repository-Hauptverzeichnis kopieren, keine zusätzliche Ordnerstufe. `index.html` muss im Root liegen. Commit → Push. Danach URL mit `?v=roissy31` öffnen. Bildschirm-Version: **ROISSY · V3.1**.

## Transparenz

Die exakten historischen Innenmaße sowie mehrere Wand-/Türachsen sind aus den Stichen nur näherungsweise rekonstruierbar; weder perfekte Grundrisstreue auf Zentimeter noch ein realer Safari-Test sind bestätigt. Den vorhandenen Quellstand nicht löschen, bevor die neue Fassung auf dem iPhone kontrolliert ist.
