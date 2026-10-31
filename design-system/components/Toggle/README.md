# Toggle

A two-state button for formatting and view options.

**The consumer provides** `pressed` + `onPressedChange` (or `defaultPressed`), an icon and / or a short label, `variant` (`default`, `outline`), `size` (`sm`, `default`, `lg`) and an `aria-label` when it's icon-only.

- 13px / 500 in `fg-muted`; hover `surface-hover`. On: `accent-subtle` fill with `accent-fg` text. `outline` adds a `border` hairline. Focus shows `--ring-focus`.
- `aria-pressed` comes from Radix; Space and Enter toggle.
- For options that stay on until switched off (wrap lines, show grid). For a setting that applies to the account, use `Switch`; for a choice among several, `ToggleGroup`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/toggle` and import from `@/components/ui/toggle`._
