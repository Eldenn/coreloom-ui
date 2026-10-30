# Alert

Inline status banner for info, success, warning and danger messages.

**The consumer provides** a `variant` (`default` = info, `success`, `warning`, `destructive`), an optional leading Lucide icon, an `<AlertTitle>` and an `<AlertDescription>`.

- Each variant fills with its `-subtle` token, borders at 35% and colors the icon; title 14px / 600 in `fg-1`, description 13px in `fg-2`, `radius-md`.
- `destructive` and `warning` render `role="alert"`, the others `role="status"` — override with `role` if needed.
- Lead with what happened, then where to look: "Deploy failed" / "Type error in src/theme.ts — see logs."

**In an app:** `pnpm dlx shadcn@latest add @coreloom/alert` and import from `@/components/ui/alert`.
