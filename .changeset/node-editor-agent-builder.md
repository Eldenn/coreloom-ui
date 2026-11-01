---
'@coreloom/ui': minor
---

### Added

- `NodeEditor` (`@coreloom/node-editor`): an n8n-style canvas on React Flow (`@xyflow/react`).
  The app declares its node kinds (ports, settings as data, icon, a summary line); people add nodes
  from a searchable list, drag them, draw connections from an output to an input, and configure the
  selected node in a side panel that also lists and makes connections, so everything works from the
  keyboard. Undo/redo, tidy up, zoom; missing settings and loose ends are flagged; `runs` shows what
  the app's run reports for each node. Nothing runs inside. Pure helpers for app code: `addNode`,
  `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `layoutWorkflow`,
  `validateWorkflow`, `nodePorts`.
- `WorkflowBuilder` (`@coreloom/workflow-builder`): an automation's page — name, Save, Run (which
  waits until no node needs attention) — above the node editor.
- `AgentBuilder` (`@coreloom/ai-agent-builder`): design an agent graph the LangGraph way — shared
  state with replace/append reducers, Agent, Tools, Function, Router (conditional edges, one output
  per route), Human review and Subgraph nodes between START and END. `toLangGraphJSON` /
  `fromLangGraphJSON` read and write the shape of LangGraph's `get_graph().to_json()`; `onSave` and
  `onRun` get the graph and that JSON. No dependency on LangGraph.

### Upgrading

- The new items read new strings (`nodeEditor`, `workflow`, `ai.agentBuilder`): re-install
  `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with
  `--overwrite` first.
- `@coreloom/node-editor` adds the `@xyflow/react` dependency and imports its base stylesheet
  (`@xyflow/react/dist/base.css`) from the component.
