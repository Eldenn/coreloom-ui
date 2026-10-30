# Button

Primary interactive control on shadcn/ui, cyan by default.

**The consumer provides** the label (with an optional leading or trailing Lucide icon as a child), `variant`, `size`, and the usual button props. `asChild` renders the styles onto its child, for links: `<Button asChild><a href="/docs">Read the docs</a></Button>`.

- `default` — `accent` fill, `fg-on-accent` text; hover `accent-hover` + `glow-accent`, press `accent-press`. **One per view.**
- `secondary` — `surface-2` with a `border` hairline: everything that isn't the main action.
- `outline` — transparent with a `border` hairline, for quiet actions on busy surfaces.
- `ghost` — transparent, `fg-2`; Cancel, toolbars, tertiary actions.
- `destructive` — transparent, `danger` text and a 40% danger border; hover `danger-subtle`. Pair it with the word ("Delete"). Its focus ring is the usual `accent-ring`.
- `link` — inline text action in `accent-fg`.
- Sizes `sm` (13px), `default` (14px), `lg` (15px) and `icon`, `icon-sm`, `icon-lg` squares; `radius-md`, semibold Geist. Icon-only buttons need an `aria-label`, ideally a `Tooltip`.
- Focus shows `--ring-focus` (3:1 on every surface). Disabled buttons drop to `fg-faint` on `surface-2` and leave the tab order. Labels in sentence case, no emoji.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/button` and import from `@/components/ui/button`.
