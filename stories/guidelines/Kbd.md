# Kbd

A keyboard key, for shortcuts in tooltips, menus and docs.

**The consumer provides** the key as text (`⌘K`, `Esc`, `Ctrl`); group several with `<KbdGroup>`.

- 11px mono in `fg-muted` on `surface-2` with a `border` hairline and `radius-xs`. Inside a `TooltipContent` it switches to an outline in the tooltip's ink.
- Write keys the way the platform labels them; show the Mac and PC forms only when both matter.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/kbd` and import from `@/components/ui/kbd`.
