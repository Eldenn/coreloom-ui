# Combobox

A searchable select, built from `Popover` and `Command` (shadcn's combobox pattern).

**The consumer provides** `options` (`{ value, label, icon?, keywords?, disabled? }`), `value` + `onValueChange` (or `defaultValue`), `placeholder`, `searchPlaceholder`, `emptyText`, and an `id` for its `FieldLabel` (or an `aria-label`).

- The trigger matches `Select` and `Input`: `surface-inset`, `border`, 42px, `accent` border while open. The list is a `Popover` at least as wide as the trigger, with a search row on top. The current option shows an `accent` check.
- Filtering and keyboard navigation come from `cmdk`: type to filter, arrows to move, Enter to pick, Escape to close. `keywords` let "us" find "Washington (iad1)".
- Use it instead of `Select` once the list passes about 15 options, or when people know what they're looking for. For several values, compose `Popover` + `Command` the same way with checkboxes.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/combobox` and import from `@/components/ui/combobox`._
