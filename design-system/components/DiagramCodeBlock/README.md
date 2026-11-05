# Diagram Code Block

Draws the ```mermaid and ```plantuml blocks of a Markdown answer as diagrams (class, sequence, state, ER, C4, use case, activity, deployment, component, package) with UML Diagram, and a Diagram / Source switch. While the answer streams, and when the text can't be read, the plain code block shows.

**Register it once around a chat:** `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>`, or pass `codeBlocks={diagramCodeBlocks}` to one `Markdown`. `DiagramCodeBlock` takes Markdown's code block props (`code`, `language`, `streaming`, `children`) and `height` (340).

- Nothing is drawn while the answer is written: half a diagram would flicker.
- Text it can't read shows a short note and the code as written.
- The switch is a radio group named "Show as"; the source keeps its Copy button.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-code-block`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
