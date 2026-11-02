# SortableList

Items to put in order: rank priorities, order a checklist's steps or an export's columns, answer "rank these from most to least important".

**The consumer provides** `options` (`{ value, label, description?, icon? }`; `label` is a string), `value` + `onValueChange` (the values in their order; options it leaves out go at the end), a name (`aria-label` or `aria-labelledby`), and optionally `numbered` (true) and `disabled`.

- Three ways to move an item: drag it by its handle, focus the handle and press Space then the arrows (dnd-kit, announced to screen readers), or use its up and down buttons, which keep the focus as the item moves.
- With `numbered`, each row shows its rank, so the order reads at a glance.
- Use it when the order is the answer. For picking a subset first, put a TransferList or a CheckboxGroup before it.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/sortable-list` and import from `@/components/ui/sortable-list`._
