---
'@coreloom/ui': minor
---

### Added

- `NodeEditor`: pinned sample data. `WorkflowNode.pinned` holds a sample output, set from Output
  ("Pin this output", or "Add sample data" as JSON). It stands in while no run reports an output, and
  a node without output passes its input on, so a sample pinned to the trigger feeds every node after
  it.
- `NodeEditor`: drag a field from the Input tab onto a setting; it lands as `{{ path }}`.
- `NodeEditor`: "+" after unconnected outputs and on connections adds a node there, connected;
  right-click menus for nodes, connections and the canvas; Ctrl/⌘+C / X / V copy, cut and paste
  nodes with their connections (also through the system clipboard); D or `WorkflowNode.disabled`
  disables a node (dimmed, not checked).
- Helpers: `insertNodeOnEdge`, `copyNodes`, `pasteNodes` (untrusted input is filtered).

### Changed

- `NodeEditor`: key/value rows put the key above the value, so both stay readable in the panel.
- `updateNode` takes `disabled` and `pinned`; `undefined` (or `disabled: false`) removes the key.

### Upgrading

- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`
  (it now uses `@coreloom/context-menu`).
- If your run executes the graph, skip nodes with `disabled: true` (pass their input on), and decide
  whether a `pinned` output replaces running the node.
