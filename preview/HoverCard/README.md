# HoverCard

A preview card shown when a pointer rests on a link or a name.

**The consumer provides** `<HoverCard openDelay closeDelay>` with a `<HoverCardTrigger asChild>` around a link, and `<HoverCardContent align side>` with the preview: an `Avatar`, a name, one line of context, a little meta.

- Same surface as `Popover`: `surface-1`, `border`, `radius-md`, `shadow-lg`, 288px wide, 8px from the trigger, at `z-popover`.
- Pointer only: keyboard and touch users never see it. Put nothing there that isn't also on the page the link opens, and no buttons.
- For people, repositories and packages mentioned in text. For anything interactive, use `Popover`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/hover-card` and import from `@/components/ui/hover-card`._
