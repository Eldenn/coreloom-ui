# Node Editor

An n8n-style canvas on React Flow. The app declares its `kinds` of node — label, icon, category, input and output ports (outputs can depend on the settings, one per route), settings as data (`text`, `textarea`, `number`, `select`, `switch`, `list`, `custom`), a summary line — and the editor lets people add them from a searchable list, drag them, draw connections from an output to an input, and configure the selected node in a side panel. The panel also lists and makes connections, so everything works from the keyboard. Undo/redo, tidy up, zoom; missing settings and loose ends are flagged on the cards. Nothing runs inside: pass `runs` to show what your app's run reports for each node.

**`NodeEditor` takes** `kinds`, `value` / `defaultValue` / `onValueChange` (a `Workflow`: `nodes` and `edges`, plain data), and optionally `runs`, `selectedId` / `defaultSelectedId` / `onSelectedChange`, `readOnly`, `inspector` (true), `showIssues` (true), `actions`, `height` (560) and `label`.

- Helpers for your own code: `addNode`, `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `layoutWorkflow`, `validateWorkflow`, `nodePorts`.
- Below 720 px of width the panel goes under the canvas.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/node-editor`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
