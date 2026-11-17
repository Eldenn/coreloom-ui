# TransferList

Two lists side by side, "Available" and "Selected", with buttons to move ticked items between them: columns to show in a table, members of a group, the permissions of a role.

**The consumer provides** `options` (`{ value, label, description?, disabled? }`), `value` + `onValueChange` (the selected values, a `string[]`), a name (`aria-label` or `aria-labelledby`), and optionally `availableLabel`, `selectedLabel` and `disabled`.

- Each list can be filtered and shows how many items are ticked ("2/14"). The buttons move the ticked items or all of them, and the move is announced ("2 moved to Selected."). A button with nothing to move is dimmed and `aria-disabled` but stays focusable, so the focus stays on it after a move.
- The value keeps the options' order. A disabled option stays where it is, which suits a column that must always show.
- On a narrow screen the lists stack, with the buttons between them. Use it for long lists people sort through; for a dozen options, a CheckboxGroup is quicker.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/transfer-list` and import from `@/components/ui/transfer-list`.
