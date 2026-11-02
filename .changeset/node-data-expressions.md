---
'@coreloom/ui': minor
---

### Added

- `NodeEditor`: the node panel has Settings, Input and Output tabs. `runs` takes each node's
  `input` and `output`; Input falls back to the output of the node before it.
- `NodeEditor`: text fields take `{{ path }}` expressions. Typing `{{` (or the braces button)
  suggests the input's fields, the app's `variables` and earlier nodes' outputs
  (`$node.<id>.<path>`) with a sample each; a preview under the field fills them from the sample.
  `expression: false` turns it off for a field.
- `NodeEditor`: `onRunNode({ node, input, workflow })` adds "Test node". The app runs that one node
  and resolves with `{ status?, output?, message? }`, shown on the card and under Output and offered
  to the nodes after it.
- `NodeEditor`: new field types — `conditions` (rules matched all or any, with the result for the
  sample), `keyValue` (rows of key and value), `code` (monospace; JSON is checked and an invalid one
  is an issue with the code `invalid`) and `credential` (one of the app's `credentials`, ids and
  names only; `onCreateCredential` adds "New credential").
- `node-editor-fields`: `resolveExpression`, `evaluateConditions`, `keyValuesToObject`, `dataPaths`,
  `readPath`, `jsonError` — path lookup only, nothing is evaluated.
- `WorkflowBuilder` passes the new props through `editorProps`; `AgentBuilder` takes `onRunNode` and
  offers its state fields in expressions.

### Upgrading

- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`:
  it now has a second file, `node-editor-fields.tsx`, and needs `@coreloom/tabs`.
- `text` and `textarea` fields now take expressions and show the braces button; add
  `expression: false` where that isn't wanted.
- `WorkflowIssue` has a new code, `invalid`: handle it if you switch over the codes.
