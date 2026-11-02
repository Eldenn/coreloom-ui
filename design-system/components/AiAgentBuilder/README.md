# AI Agent Builder

Design an agent graph the way LangGraph models it: a shared state (fields with a replace or append reducer), nodes — Agent (model, instructions with `{{variables}}`, tools), Tools, Function, Router (one output per route: LangGraph's conditional edges), Human review, Subgraph — between START and END. **State** edits the state's fields; **LangGraph JSON** shows the graph in the shape of `get_graph().to_json()` and imports one.

**`AgentBuilder` takes** `models`, `tools`, `value` / `defaultValue` / `onValueChange`, `state` / `defaultState` / `onStateChange`, `name` / `defaultName`, and optionally `onSave`, `onRun` (both get the graph and its LangGraph JSON), `running`, `runs`, `readOnly`, `defaultSelectedId` and `height`.

- `toLangGraphJSON(workflow, state)` and `fromLangGraphJSON(jsonOrText)` convert both ways; positions, names and settings travel in each node's `metadata.coreloom`.
- `useAgentBuilderKinds({ models, tools })` gives the node kinds, to use NodeEditor directly.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-builder`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
