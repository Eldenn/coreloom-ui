# Tabs

Switch between panels of one view.

**The consumer provides** `<Tabs value onValueChange>` (or `defaultValue`) with a `<TabsList>` of `<TabsTrigger value>`s (an optional Lucide icon inside), and one `<TabsContent value>` per tab. `<TabsList variant="line">` switches to the underline style.

- `default` (pills): a `surface-1` track with a `border-subtle` hairline; the active tab sits on `surface-hover` in `fg-1`, others in `fg-muted`, 13px / 500. Use it for views of one thing: Preview / Code / Props.
- `line`: 14px tabs on a `border-subtle` rule, the active one in `fg-1` with a 2px `accent` bar. Use it for page sections.
- Radix gives the `tablist` roles, arrow-key navigation and skips disabled tabs. One or two words per label; beyond six tabs, use side navigation.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/tabs` and import from `@/components/ui/tabs`._
