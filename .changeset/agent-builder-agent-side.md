---
'@coreloom/ui': minor
---

### Added

- `AgentBuilder` (`@coreloom/ai-agent-builder`): the agent side of the node editor.
  - **Reads / Writes**: each node names the state fields it uses and updates.
  - **Structured output**: an Agent can answer in a JSON Schema (checked as JSON).
  - **Tool parameters**: `AgentBuilderTool` takes `parameters` (a JSON Schema object) and
    `sensitive`; each parameter can be fixed per node (a value, an `{{ }}` expression, an `enum`
    value) or left to the model (`toolArgs`).
  - **Ask before running** (`askFirst`): tool calls a person approves first; sensitive tools are
    added when picked.
  - **Limits**: an Agent's max steps, max tokens per answer and timeout; the graph's recursion limit
    under State (`config` / `defaultConfig` / `onConfigChange`).
  - **Pauses**: any Agent, Tools, Function or Subgraph node can pause the run before or after it.
    `toLangGraphConfig(workflow, config)` gives `interrupt_before`, `interrupt_after` and
    `recursion_limit`; `onSave` and `onRun` now also get it as `config`.
  - **Review**: pass `interrupt` when your run pauses and a dialog lets a person approve, edit or
    reject each tool call, or answer a question; `onResume({ nodeId, decisions })` gets the
    decisions in LangChain's human-in-the-loop shape. A Human review node picks which decisions it
    offers.
- `toLangGraphJSON(workflow, state, config)` keeps the config in START's metadata;
  `fromLangGraphJSON` returns it as `config`.

### Upgrading

- New strings in `ai.agentBuilder`: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. The block now also needs
  `@coreloom/radio-group`.
