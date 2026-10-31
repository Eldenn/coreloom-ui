# Drawer

A bottom sheet people can drag, built on vaul. The phone counterpart of `Dialog`.

**The consumer provides** `<Drawer open onOpenChange direction>` (or a `<DrawerTrigger asChild>`) and a `<DrawerContent>` holding a `<DrawerHeader>` with `<DrawerTitle>` and `<DrawerDescription>`, the body, and a `<DrawerFooter>`. Wrap Cancel in `<DrawerClose asChild>`. Cap the inner width (`max-w-[420px] mx-auto`) on large screens.

- The panel is `surface-1` with a `border` edge and `shadow-xl`, over the `scrim` at `z-modal`. A bottom drawer shows a 48px drag handle in `border-strong`. The title is `font-display` 20px / 600, and footer buttons stack full width.
- Drag down, Escape or a click on the scrim closes it. Focus is trapped while it's open.
- On phones, use it for short tasks (rename, filters, share). On desktop, the same task belongs in a `Dialog`. Switch on a media query (`useIsMobile`).

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/drawer` and import from `@/components/ui/drawer`._
