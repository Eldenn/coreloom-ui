# Workflow Builder

An automation's page: its name, Save and Run above the node editor with your app's node kinds. The block stores nothing and runs nothing: `onSave` gets the graph and the name, `onRun` hands the graph to your app, and `runs` shows what your run reports for each node.

**The consumer provides** `kinds`, the graph (`value` / `onValueChange` or `defaultValue`) and the name (`name` / `onNameChange` or `defaultName`). Optionally: `onSave(workflow, name)` (a promise; a rejection shows "Couldn't save"; no Save button without it), `onRun(workflow)` (no Run button without it), `running` (false), `runs`, `readOnly`, `actions` (more buttons before Save), `height` and `editorProps` (anything else for the editor: selection, `inspector`, `showIssues`, `onRunNode` for "Test node", `variables`, `credentials` and `onCreateCredential`).

- Run waits until no node needs attention, and says how many nodes to fix; the reason is the button's description.
- The save state ("Unsaved changes", "Saving…", "Saved", "Couldn't save") is a status message next to the name.
- The name is a plain text field labelled "Workflow name".

**In an app:** `pnpm dlx shadcn@latest add @coreloom/workflow-builder`.
