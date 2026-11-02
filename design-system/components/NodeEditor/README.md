# Node Editor

An n8n-style canvas on React Flow. The app declares its `kinds` of node — label, icon, category, input and output ports (outputs can depend on the settings, one per route), settings as data (`text`, `textarea`, `number`, `select`, `switch`, `list`, `conditions`, `keyValue`, `code`, `credential`, `custom`), a summary line — and the editor lets people add them from a searchable list, drag them, draw connections from an output to an input, and configure the selected node in a side panel. The panel also lists and makes connections, so everything works from the keyboard. Undo/redo, tidy up, zoom; missing settings and loose ends are flagged on the cards. Nothing runs inside: pass `runs` to show what your app's run reports for each node, with its input and output. Text fields take `{{ path }}` expressions, suggested from the data the node receives and previewed against it; `onRunNode` adds "Test node". Pin sample data to a node to set the flow up without a run; "+" on outputs and connections, copy/paste, a right-click menu and disabled nodes speed up editing. Notes and groups annotate the canvas (a group moves what's inside it), a minimap shows the whole graph, and Find (Ctrl/⌘+F) jumps to any node, note or group.

**`NodeEditor` takes** `kinds`, `value` / `defaultValue` / `onValueChange` (a `Workflow`: `nodes` and `edges`, optionally `notes` and `groups`, plain data), and optionally `runs`, `onRunNode`, `variables`, `credentials` / `onCreateCredential`, `selectedId` / `defaultSelectedId` / `onSelectedChange`, `readOnly`, `inspector` (true), `showIssues` (true), `actions`, `minimap` (true), `height` (560) and `label`.

- Helpers for your own code: `addNode`, `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `insertNodeOnEdge`, `copyNodes`, `pasteNodes`, `layoutWorkflow`, `validateWorkflow`, `nodePorts`; `resolveExpression`, `evaluateConditions`, `keyValuesToObject`, `dataPaths` (from `node-editor-fields`); `addNote`, `addGroup`, `updateNote`, `updateGroup`, `moveGroup`, `groupMembers`, `removeCanvasItems` (from `node-editor-canvas`).
- Below 720 px of width the panel goes under the canvas, which is then at most 420 px tall.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/node-editor`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
