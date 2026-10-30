# Select

Pick one value from a list, with a fully styled, keyboard-navigable listbox.

**The consumer provides** `<Select value onValueChange>` (or `defaultValue`) holding a `<SelectTrigger>` with `<SelectValue placeholder>`, and a `<SelectContent>` of `<SelectItem value>`s, optionally grouped with `<SelectGroup>` + `<SelectLabel>` and split by `<SelectSeparator>`. Name the trigger with a `FieldLabel` or `aria-label`.

- Trigger matches `Input`: `surface-inset`, `border-strong`, 42px, chevron in `fg-muted`; open or focused it turns `accent`.
- The list is a `surface-1` popover with a `border`, `shadow-lg` and `radius-md`, placed under the trigger (`popper`) at `z-popover`, so it also opens above a `Dialog`. Group labels are mono uppercase; the selected item shows an `accent` check.
- Type-ahead, arrows, Home / End and Escape work out of the box (Radix). Use it for 4–15 options; for 2–3, use a `RadioGroup`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/select` and import from `@/components/ui/select`.
