# Card

Elevated surface panel for features, content and stats.

**The consumer provides** the parts it needs, in order: `<CardIcon>` (a Lucide icon in a 34px tinted tile), `<CardHeader>` with `<CardTitle>` and `<CardDescription>` (and an optional `<CardAction>` at the right), `<CardContent>`, and `<CardFooter>` for mono metadata. `accent` features the card.

- `surface-2`, 1px `border`, `radius-lg`, `shadow-md`, 20px side padding; title in `font-display` 17px / 600, description 13px in `fg-muted`, footer 11px mono in `fg-muted`.
- `accent` swaps the border for `glow-accent` plus the faint cyan top-light (≤6%). Feature at most one card per group.
- Keep numbers real — leave the footer out rather than invent one.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/card` and import from `@/components/ui/card`._
