# CHÂTEAU GRAND — ROISSY V3.6 — VESTIBÜL & KONSTRUKTIONSKORREKTUREN

Vollständiges Browser-Spiel auf der Three.js/MaxGame-Basis. Die historische Roissy-Raumfolge bleibt im EG und 1. OG erhalten (18/21 Zonen), einschließlich der zweigeschossigen Salonöffnung und der begehbaren 36-stufigen Haupttreppe.

## Diesmal gezielt verbessert

- **Eingangshalle:** Maßstäblicher Naturstein-Plattenboden mit 3 PBR-Bildmaps (Farbe, Normale, Rauheit), matt statt spiegelglatt; umlaufendes, bodenbündiges Steinband und Wand-Sockelleisten, an Türöffnungen unterbrochen. Die Bilder sind aus dem bereits vorhandenen MaxGame-Kalksteinmaterial generiert.
- **Portikus/1. Obergeschoss:** Der originale MaxGame-Dreiecksgiebel ragte in V3.5 um mehr als einen Meter hinter die äußere Fassade. Er wurde als ganze importierte Baugruppe nach außen gerückt; eine Maßprüfung sichert die rückwärtige Giebelkante ab.
- **Außenecken:** Steinquader an Gebäudeecken werden nur noch an der Außenfläche erzeugt, nicht mehr halb in den Eckzimmern.
- **Eingangshalle:** Ein dezent warmer, nicht schattenwerfender Lichtfüller verbessert die Lesbarkeit des Steinmaterials, ohne die Mobile-Schattenkarte zu belasten.
- **Bestand:** Außenhülle (54×23 m), Roissy-Raumfolge, originale Herrenhaus-Säulen, drei automatische Türen, durchsichtige Fenster und Rundgang erhalten.

## Installation

Archiv ohne zusätzlichen Projektordner entpacken, Inhalt direkt in das GitHub-Repository `Chateau-Grand-2027` übertragen. Überschreibe die Dateien, Commit → Push. Adresse mit `?v=roissy36` öffnen. Anzeige oben rechts **ROISSY · V3.6**.

## Historische Verlässlichkeit

Die Fenster- und Raummaße sind aus einer publizierten Le-Rouge-Zeichnung (1776) abgeleitete Näherungswerte; die heutige Portikus-Gestaltung und Kuppel sind kreative Weiterentwicklungen. Der neue Natursteinboden ist **historisch plausibel, nicht als Originalbelag nachgewiesen**. Es wird keine exakte bauarchäologische Rekonstruktion behauptet.

## Prüfung

`node test-model.mjs`, `node test-building-qa.mjs`, `node test-v36-vestibule.mjs` ausführen. JavaScript-Syntax, begehbare Höhen, Projektstruktur und Archiv zusätzlich prüfen. **Ein echter Safari-Grafiktest ist hier nicht erfolgt.**
