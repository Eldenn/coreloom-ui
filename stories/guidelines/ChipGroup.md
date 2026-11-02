# ChipGroup

Pills that toggle on and off: filters above a list ("Open · Mine · This week"), interests on a profile, the sizes in stock.

**The consumer provides** `options` (`{ value, label, icon?, count?, disabled? }`), `type` (`"multiple"`, the default, for a `string[]`; `"single"` for a `string`), `value` + `onValueChange` (or `defaultValue`), a name (`aria-label` or `aria-labelledby`), and optionally `size` (`sm`, `default`), `name` and `disabled`.

- Each chip is a native checkbox (or radio with `type="single"`), so Tab, Space and arrows behave as people expect. A ticked chip shows a check, so the state never rests on colour alone.
- The value keeps the options' order, whatever the order of clicks. `count` adds a number after the label (results for that filter).
- Use it for a handful of short filters or tags shown at once. Use CheckboxGroup for longer labels in a form, SegmentedControl for one view among two to five, and MultiSelect when the list is long.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/chip-group` and import from `@/components/ui/chip-group`.
