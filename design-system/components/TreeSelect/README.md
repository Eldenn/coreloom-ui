# TreeSelect

A select whose options nest: a department in an organisation, a category in a catalogue, a folder, a region in a country.

**The consumer provides** `nodes` (`{ value, label, children?, disabled? }`), `value` + `onValueChange` (a `string`, or a `string[]` with `multiple`), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `placeholder` and `disabled`. `flattenTree(nodes)` lists every node with its level, parent and path.

- The popover holds a tree (APG pattern): Up and Down move, Right opens a branch or enters it, Left closes it or goes to the parent, Home and End jump, Enter or Space picks.
- Any node can be picked, branch or leaf. The trigger shows the path ("Engineering / Frontend"), or "3 selected" with `multiple`. Branches holding the value open on their own.
- Use it when the hierarchy helps people find the option. When it doesn't, flatten the list into a Combobox with the path as `keywords`.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/tree-select` and import from `@/components/ui/tree-select`._
