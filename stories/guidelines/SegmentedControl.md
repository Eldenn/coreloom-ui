# SegmentedControl

Two to five options side by side in one pill, exactly one picked: "Day · Week · Month", "List · Board", "Monthly · Yearly".

**The consumer provides** `options` (`{ value, label, icon?, disabled? }`), `value` + `onValueChange` (or `defaultValue`, the first option otherwise), a name (`aria-label` or `aria-labelledby`), and optionally `size` (`sm`, `default`), `iconOnly`, `fullWidth`, `name` and `disabled`.

- It is a radio group: Tab reaches it once, arrows change the pick, and screen readers hear "Week, radio button, 2 of 4".
- With `iconOnly`, each label stays as the option's accessible name and tooltip, so give string labels.
- Use it to change a view or a setting in place. Use ToggleGroup for buttons that act on something (bold, align), and Tabs to switch between panels of content.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/segmented-control` and import from `@/components/ui/segmented-control`.
