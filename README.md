# Château Grand Roissy V3.24 – Französische Innentüren

44 automatisch öffnende Innentüren mit 88 Eichen-Kassettenflügeln, profilierten Zargen und Messingbeschlägen. Zwei Türöffnungen im Obergeschoss korrigiert. Fenster, Außenfassade, Eichenportale, Treppen und Bodenbeläge unverändert. Keine neue Beleuchtung.

## Installation
ZIP komplett entpacken und den Inhalt in die Wurzel des bestehenden Repositorys kopieren; vorhandene Dateien ersetzen. GitHub Pages: `?v=roissy324`. Versionsanzeige `ROISSY · V3.24`.

## Tests
`node --experimental-default-type=module tests/validate-interior-doors-v324.mjs`
Weitere bestandene Regressionstests: `validate-exterior-v313`, `validate-interior-v320`, `validate-surfaces-v314`, `validate-stair-v310`, `validate-portals-v321`, `validate-windows-v323` (gleicher Node-Aufruf). Details in CHANGES-V3.24.md. Browserprüfung wegen EGL/ANGLE-Fehler nicht möglich.
