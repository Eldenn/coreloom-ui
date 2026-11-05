# Diagram Code Block

Draws the `mermaid and `plantuml blocks of a Markdown answer as diagrams with UML Diagram: class, sequence, state, entity–relationship, C4, use case, activity (Mermaid flowcharts too), deployment, component and package. A switch above the drawing goes back to the source, which keeps its Copy button. Everything is read in the browser, with no `mermaid` or PlantUML dependency.

**The consumer provides** nothing per block: register the renderers once around a chat with `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>` (from `@/components/ui/markdown`), or pass `codeBlocks={diagramCodeBlocks}` to one `Markdown`. `diagramCodeBlocks` maps the fence languages mermaid, plantuml and puml to `DiagramCodeBlock`, which takes Markdown's code block props (`code`, `language`, `streaming`, `children`: the plain code block) and `height` (340). Add your own languages the same way: `{ ...diagramCodeBlocks, uml: DiagramCodeBlock }` (a language named uml).

- While the answer is written (`streaming` on the Markdown), the block stays code: half a diagram would change with every token.
- Text it can't draw (a diagram type it doesn't read, or a line with an error) shows a short note, "This diagram couldn't be drawn, so here is its text", then the code as written.
- The kind of diagram is the label above it and the drawing's accessible name; the drawing is UML Diagram's, so Tab moves through its elements and relations, and a sequence gives its steps as a list to screen readers.
- The switch is a Segmented Control named "Show as" (Diagram, Source); arrow keys change it.
- A text in PlantUML (`@startuml`) is read as PlantUML whatever the fence says.
- Model output is untrusted: the text is parsed into the UML model and drawn from it, never rendered as HTML or SVG from the text.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-code-block` and import from `@/components/ui/diagram-code-block`.
