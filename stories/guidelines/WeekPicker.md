# WeekPicker

An ISO week (Monday to Sunday), for timesheets, sprints and weekly reports.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), with the value as "YYYY-Www" ("2026-W44", the format of `<input type="week">`), a label (`id` for a FieldLabel), and optionally `calendarProps` (disabled days, months shown), `placeholder` and `disabled`.

- The calendar shows week numbers and highlights the picked week; clicking any day, or Enter on it, picks its week.
- The trigger reads "Week 44 · 26 Oct – 1 Nov 2026" in the i18n locale.
- `toWeekValue(date)` and `weekRange(value)` (its Monday and Sunday) are exported.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/week-picker` and import from `@/components/ui/week-picker`.
