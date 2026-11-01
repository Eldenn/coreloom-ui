# AI Agent Builder

Design an agent graph the way LangGraph models it, on the node editor: a shared **state**, **nodes** — Agent (a model with instructions and tools), Tools (runs the tools an agent asked for), Function (a step of your own code), Router (picks the next step: one output per route), Human review (pauses until a person answers), Subgraph — and **edges** between START and END. A Router is how the editor draws LangGraph's conditional edges. Nothing runs here: your app runs the graph (with LangGraph or anything else) and reports through `runs`.

**The consumer provides** `models` (the Agent node's picker; a text field without them) and `tools` (`{ id, name }`, offered to Agent and Tools nodes), the graph (`value` / `onValueChange` or `defaultValue`, START and END by default), the state (`state` / `onStateChange` or `defaultState`, `messages` with append by default) and the name. Optionally: `onSave({ workflow, json, name })`, `onRun({ workflow, json })` — both get the graph and its LangGraph JSON — `running`, `runs`, `readOnly`, `defaultSelectedId` and `height`.

- **State** opens the state's fields: a name, a type, and how an update applies — _Replace_ keeps the last value, _Append_ adds to a list (LangGraph's `add_messages` / `operator.add` reducers).
- **LangGraph JSON** shows the graph in the shape of `graph.get_graph().to_json()` and imports one. A Router becomes conditional edges from the nodes that lead to it, the route name in each edge's `data`. Positions, names and settings travel in each node's `metadata.coreloom`, so an export imports back unchanged.
- Importing a graph exported by LangGraph itself: each node with conditional edges gets a Router after it, `ToolNode`s become Tools, nodes named like an agent become Agents, the rest Functions; the graph is laid out left to right. Unknown or malformed entries are skipped.
- `toLangGraphJSON(workflow, state)` and `fromLangGraphJSON(jsonOrText)` do the same in your code; `useAgentBuilderKinds({ models, tools })` gives the node kinds, to use `NodeEditor` directly.
- An Agent's instructions list the `{{variables}}` they use, read from the state.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-builder`.
