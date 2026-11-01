# Workflow Builder

An automation's page: its name, Save and Run, then the node editor with your app's node kinds. `onSave` stores the graph (a rejected promise shows "Couldn't save"); `onRun` hands it to your app, which reports each node through `runs`. Run waits until no node needs attention, and says how many to fix.

**`WorkflowBuilder` takes** `kinds`, `value` / `defaultValue` / `onValueChange`, `name` / `defaultName` / `onNameChange`, and optionally `onSave`, `onRun`, `running`, `runs`, `readOnly`, `actions`, `height` and `editorProps`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/workflow-builder`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
