# Badge

Compact mono-type status or metadata pill.

**The consumer provides** one or two words as children, a `variant` and optionally a leading `<BadgeDot />`. `asChild` makes it a link.

- `JetBrains Mono` 11px / 500 on a `radius-pill`. `default` = cyan (`accent-subtle` fill, `accent-fg` text), `secondary` (the default) = neutral `surface-2` with a `border` hairline, `success`, `warning`, `destructive` on their `-subtle` fills, `outline` = hairline only.
- Use for versions (`v2.4.0`), build state and short metadata. The word carries the meaning; the dot only reinforces it.
- Every variant's text passes 4.5:1 on its own fill in both themes; the light theme uses deeper `success`, `warning` and `danger` values for this. `default` uses `accent-fg` text.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/badge` and import from `@/components/ui/badge`.
