# ActionBar

A bar for the items people selected in a table or a list, with how many there are and what can be done to all of them: archive, move, export, delete.

**The consumer provides** the `count`, the actions as `children` (small Buttons or a DropdownMenu) and `onClear`. Optional: `label` ("3 of 120 invoices selected"), `open` to force it, and `position`: `fixed` floats at the bottom of the screen, `sticky` at the bottom of a scrolling area, `static` stays in the flow.

- It appears with the first selection and goes away with the last; the new count is announced to screen readers.
- Escape inside the bar, or its close button, clears the selection.
- Three or four actions at most, the destructive one last; more go in a menu. Confirm deletions (a Popconfirm or an AlertDialog) and say how many items they touch.
- Keep the actions in the table's own toolbar when nothing is selected; this bar is only for the selection.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/action-bar` and import from `@/components/ui/action-bar`.
