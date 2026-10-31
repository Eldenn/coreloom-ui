# DateRangePicker

A date range field: a trigger that opens two months of `Calendar` in range mode, with shortcuts down the side.

**The consumer provides** `value` + `onValueChange` (a `{ from, to }` range — react-day-picker's `DateRange` — or `undefined`; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `presets` (`[{ label, range: () => ({ from, to }) }]`, or `false` to hide them), `numberOfMonths` (2), `formatString` (date-fns, `"PP"`), `locale` and `calendarProps` (disabled days, `min` / `max` nights…).

- The trigger matches `DatePicker`: "Oct 1, 2026 – Oct 14, 2026", or one date for a single day. The built-in shortcuts are Today, Yesterday, Last 7 days, Last 30 days, This month and Last month; the active one is pressed (`aria-pressed`). Picking a shortcut closes the popover; picking days keeps it open until you click away.
- Month and day names, the week start and the label follow the i18n `dateLocale`; shortcut labels come from the messages.
- For reports, analytics and exports. For one date, use `DatePicker`.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/date-range-picker` and import from `@/components/ui/date-range-picker`. In a form: `field.DateRangeField`._
