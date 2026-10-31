# Separator

Hairline divider between groups of content.

**The consumer provides** `orientation` (`horizontal` default, `vertical`); `decorative={false}` when it carries meaning for screen readers.

- 1px `border-subtle`. Vertical separators need a parent with a set height.
- Prefer spacing first; reach for a rule only where groups would otherwise run together.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/separator` and import from `@/components/ui/separator`._
