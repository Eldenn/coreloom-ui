# ToggleGroup

A row of toggles that belong together: one choice (`type="single"`) or several (`type="multiple"`).

**The consumer provides** `<ToggleGroup type value onValueChange>` (or `defaultValue`) with an `aria-label`, `variant` and `size` for every item, `spacing` (0 joins the items into one segmented control), and one `<ToggleGroupItem value>` per option.

- Items look like `Toggle`. With `spacing={0}` and `variant="outline"` they share borders and only the ends are rounded: the view switcher.
- Radix gives roving focus: Tab enters the group, arrows move between items.
- Single: a view switch (List / Grid / Code). Multiple: filters (Ready, Building, Failed). With `type="single"`, guard `onValueChange` against `""` if the group must always have a value.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/toggle-group` and import from `@/components/ui/toggle-group`._
