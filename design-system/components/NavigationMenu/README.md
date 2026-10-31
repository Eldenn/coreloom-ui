# NavigationMenu

Site navigation with dropdown panels of links, for marketing sites and docs headers.

**The consumer provides** `<NavigationMenu viewport>` → `<NavigationMenuList>` of `<NavigationMenuItem>`s. Each item holds either a `<NavigationMenuTrigger>` + `<NavigationMenuContent>` (a panel of `<NavigationMenuLink href>`s), or a lone `<NavigationMenuLink className={navigationMenuTriggerStyle()}>`. Mark the current page's link `active`.

- Triggers are 14px / 500 in `fg-2` with a turning chevron, and sit on `surface-hover` when open. Panels are `surface-1` with a `border` and `shadow-lg`, at `z-popover`. Active links take `accent-subtle` with `accent-fg`.
- `viewport={false}` drops each panel under its own trigger. The default viewport animates one shared panel between triggers.
- Radix handles hover intent, focus and arrow keys. Panel links need a title and a one-line description. On phones, move the links into a `Sheet` (see the `SiteHeader` block).

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/navigation-menu` and import from `@/components/ui/navigation-menu`._
