---
'@coreloom/ui': minor
---

### Added

- `@coreloom/use-controllable-state`: `useControllableState({ value, defaultValue, onChange })`, the hook behind the components below that can be owned by the app or keep their own state.
- `onValueChange` on `CodeEditor` and `DiagramEditor`, the name every Coreloom field uses for its change callback.
- `defaultValue` on `ModelList`, `FacetedFilter`, `CodeEditorLanguageSelect`, `ExpressionInput` and `StateEditor`. Their `value` and `onValueChange` are now optional.
- `open` and `onOpenChange` on `AgentPlan`, `Reasoning` and `ToolCall`, to own whether they show. With `open`, `Reasoning` and `ToolCall` no longer fold or unfold by themselves.
- `defaultOpen` on `ShareDialog`, `ImageLightbox`, `ShortcutsDialog` and `Tour`. Their `open` and `onOpenChange` are now optional.

### Deprecated

- `onChange` on `CodeEditor` and `DiagramEditor`: use `onValueChange`. It keeps working until 2.0.

### Changed

- The node editor's field controls (`CodeControl`, `ConditionsControl`, `CredentialControl`, `KeyValueControl`) and the diagram editor's parts (`TextField`, `Choice`, `MemberList`) take `onValueChange` instead of `onChange`. Both items are experimental.

### Upgrading

- If you render the node editor's field controls or the diagram editor's parts yourself, rename their `onChange` prop to `onValueChange`.
