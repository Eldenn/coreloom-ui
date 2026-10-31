# Avatar

A person or project image, with initials when there is none.

**The consumer provides** `<Avatar size>` (`sm` 24, `default` 32, `lg` 40 px) with an `<AvatarImage src alt>` and an `<AvatarFallback>` of one or two initials; optional `<AvatarBadge />` for presence. Stack several in an `<AvatarGroup>` and end with `<AvatarGroupCount>+4</AvatarGroupCount>`.

- Circles; the fallback sits on `surface-2` with a `border` hairline, initials in `font-display` semibold `fg-2`. The presence badge is `success`, ringed in `bg-1`. Grouped avatars overlap by 8px with a `bg-1` ring.
- The image shows only once it has loaded (Radix), so there's no broken-image flash. Always give `alt` the person's name.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/avatar` and import from `@/components/ui/avatar`._
