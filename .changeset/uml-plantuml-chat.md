---
'@coreloom/ui': minor
---

### Added

- **Use case, activity and deployment diagrams** in `@coreloom/uml` and `@coreloom/uml-diagram`: actors (stick figures), use cases (ellipses) in their system, «include», «extend» and generalization; actions, decisions and merges (diamonds), start, end and flow end, fork and join bars, partitions and guards in brackets; nodes, devices and execution environments as 3D boxes with their keyword, artifacts, components, databases and clouds, nested in what they're deployed on, with links, dependencies and «deploy». The diagram editor's Add, Connect, properties, copy and paste work on all three.
- **PlantUML**: `parsePlantUml` and `toPlantUml` (`@coreloom/uml`, `uml-plantuml`) read and write `@startuml` text for every kind (class, sequence, state, ER, C4-PlantUML macros, use case, deployment, and activities in the new syntax), tolerant like `parseMermaid`: problems by line, skin parameters set aside with a warning. No PlantUML dependency, nothing sent to a server. `isPlantUml` tells PlantUML text from Mermaid.
- **Mermaid flowcharts** (`flowchart` / `graph`) are read as activity diagrams: `((start))`, `(((end)))`, `{decision}`, `@{ shape: fork }` and the other activity shapes, subgraphs as partitions, `&` and chained links.
- **Diagram editor**: a PlantUML format (`format="plantuml"`, `.puml` downloads), templates for the three new kinds, and pasted text in another syntax switches the format. A format that can't hold the current kind is disabled.
- **`@coreloom/diagram-code-block`**: draws the `mermaid and `plantuml blocks of a chat answer as diagrams, with a Diagram / Source switch; the plain code block while the answer streams or when the text can't be read. Register it once with `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>`. It's in `everything`.
- **Markdown**: `codeBlocks` and `MarkdownCodeBlocksContext` hand fenced code in a given language to the app's own renderer (it gets `code`, `language`, `streaming` and the plain block as `children`).

### Changed

- `toMermaid` writes use case and deployment diagrams as a plain flowchart, since Mermaid has no such diagrams; the editor doesn't offer Mermaid for them. `toPlantUml` writes activities in PlantUML's arrow syntax, which isn't read back; the editor doesn't offer PlantUML for them.
- `parseMermaid` no longer says a `flowchart` isn't a diagram type it reads.
