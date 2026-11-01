# Node Editor

An n8n-style canvas, on React Flow: nodes joined by connections, and a side panel with the selected node's settings. The app declares its **kinds** of node — label, icon, category, ports, settings — and the editor lets people add them from a searchable list, drag them, draw a connection from an output to an input, and configure them. It runs nothing: the graph is plain data your app stores and executes, and `runs` shows what your run reports for each node.

**The consumer provides** `kinds` and the graph — `value` / `onValueChange`, or `defaultValue` — as a `Workflow` (`nodes`: `{ id, type, position, name?, data? }`, `edges`: `{ id, source, sourcePort?, target, targetPort? }`). Optionally: `runs` (`{ [nodeId]: { status, message?, input?, output? } }`, status `running`, `waiting`, `success`, `error` or `skipped`; `input` and `output` are the items the node received and gave), `onRunNode` ("Test node", below), `variables` (`{ path, sample? }[]`, values every expression can use), `credentials` (`{ id, name, type }[]`) and `onCreateCredential(type)`, `selectedId` / `defaultSelectedId` / `onSelectedChange`, `readOnly` (false), `inspector` (true), `showIssues` (true), `actions` (buttons at the toolbar's end), `height` (560) and `label` ("Workflow").

**A kind** (`NodeKind`) has `type`, `label`, and optionally `description`, `category`, `icon`, `inputs` (one by default; `[]` for a trigger), `outputs` (one by default; a function of the settings for one output per route), `fields`, `defaults`, `summary(data)` (a line on the card), `max` (1 for a start node), `removable: false` and `hidden` (not offered in the list).

**Fields** are data: `text`, `textarea`, `number`, `select` (with `options`), `switch`, `list` (tags), `conditions` (rules matched all or any: `{ combinator, rules: [{ left, operator, right }] }`), `keyValue` (rows of `{ key, value }`), `code` (text in monospace; `language: 'json'`, the default, must parse), `credential` (the id of one of `credentials` with the field's `credentialType`) or `custom` with a `render({ id, labelId, value, onChange, invalid, describedBy, data })` for your own control (a model picker, a code editor). `required` fields left empty are flagged, and so is JSON that doesn't parse.

**Data and expressions.** The panel has three tabs: Settings, Input and Output. Input shows what the node received (its run's `input`, or else the `output` of the node before it), Output what it gave. Text fields take `{{ path }}` expressions (turn it off with `expression: false`): typing `{{`, or the braces button, lists the input's fields, your `variables` and every earlier node's output as `$node.<id>.<path>`, each with a sample. Under the field, a preview fills the expressions from the sample, and says which ones the sample doesn't have. A conditions field says whether it holds for the sample. Evaluation is path lookup only — nothing is ever run — and `resolveExpression`, `evaluateConditions` and `keyValuesToObject` (from `node-editor-fields`) let your app use the same rules.

**Test node.** With `onRunNode({ node, input, workflow })` the panel offers "Test node": your app runs that one node (on its backend) and resolves with `{ status?, output?, message? }`. The result shows on the card and under Output, and its fields become suggestions in the nodes after it, until your app reports a new `runs`. A rejection shows as a failed test with the error's message.

**Credentials** are only ever ids and names: the secret stays in your app. "New credential" calls `onCreateCredential(type)`, which opens your own form and resolves with the saved `{ id, name, type }`.

- Keyboard: Tab reaches each card; Enter or Space selects it, the arrow keys move it, Delete removes it. The panel lists each node's connections and makes new ones ("Connect to…"), so nothing needs a pointer. Ctrl/⌘+Z and Ctrl/⌘+Shift+Z undo and redo outside text fields.
- Adding a node while one is selected puts it to the right and connects it, as in n8n.
- Missing settings, nodes nothing leads to, unconnected routes and too many of a kind are flagged on the cards, in the panel and in the toolbar. `validateWorkflow(workflow, kinds)` gives the same list to your code.
- A connection back to an earlier node (a loop) runs below the cards instead of across them.
- In an expression list, ↑ and ↓ move, Enter inserts, Escape closes (without closing a dialog around it). The field stays a textbox and points at the active suggestion.
- Adding or removing a condition or a row moves focus to the new row, or back to "Add".
- Actions are announced in one polite live region; focus never falls to the page when a node goes away.
- Below 720 px of width the panel goes under the canvas, which is then at most 420 px tall.
- Helpers for your own code: `addNode`, `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `layoutWorkflow`, `nodePorts`.
- Don't use it to show how agents relate (AgentGraph) or a list of steps (AgentPlan): it's for building graphs.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/node-editor`. The component imports React Flow's base stylesheet (`@xyflow/react/dist/base.css`); Vite and Next.js handle that import as is.
