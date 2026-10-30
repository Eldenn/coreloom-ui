# Progress

A determinate progress bar for work with a known end.

**The consumer provides** `value` (0–100) and an `aria-label` or a visible label; show the percentage next to it in mono yourself.

- 6px `surface-hover` track with a `border` inset hairline, `accent` fill; the fill eases over `--dur-slow`. `role="progressbar"` with `aria-valuenow` (Radix).
- For uploads, builds and multi-step jobs. When you can't measure progress, use `Spinner`; when the layout is known but the data isn't, `Skeleton`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/progress` and import from `@/components/ui/progress`.
