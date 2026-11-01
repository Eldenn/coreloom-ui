---
'@coreloom/ui': minor
---

### Added

- Generative UI: `Chat` (and `ChatWidget`, `ChatMessages`, `ChatMessage`) take `tools`, a map from
  tool name to `{ render, label, display }`, so a tool call shows as your own component (a weather
  card, a list of results) instead of JSON. `render` gets the call in every state, narrowed by
  `state` (`output` once it answers, a partial `input` while it streams, `respond(approved)` while it
  asks); returning `undefined` keeps the usual card for that state. `display: 'inline'` draws the
  component in place of the card, as a group named after the tool and busy until it answers.
- `ToolCall`: a `tool` prop takes the same object. New types `ToolComponent`, `ToolComponents`
  (typed from your tools: `ToolComponents<InferUITools<typeof tools>>`), `ToolRenderProps` and
  `ToolRenderState`.
- A Generative UI guide.

### Fixed

- `ToolCall`: after Allow or Deny, focus moves to the card instead of being lost with the buttons.
