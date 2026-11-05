---
'@coreloom/ui': minor
---

### Added

- **DiagramEditor**: an **Import** button in the top bar, between New diagram and Copy. It opens the file picker for a Mermaid (`.mmd`, `.mermaid`), PlantUML (`.puml`, `.plantuml`, `.pu`, `.iuml`, `.wsd`), JSON or `.txt` file. The file is read in the browser, replaces the text and sets the format: from the extension, or from the first words of a `.txt`. Files over 1 MB and binary files are refused, and the status line says why. Import is off when `readOnly`.
- **DiagramWorkspace**: `onImport({ title, value, result, format })`. When it's given, the Add menu ends with "Import a file…", which reads a file the same way and hands it to the app to add as a new view, named after the file.
- Strings for both in English, French, Spanish and German.
