# MonthPicker

A month of a year, for reports, billing periods and card expiry dates.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), with the value as "YYYY-MM" (or "" for none), a label (`id` for a FieldLabel), and optionally `min` and `max` ("2024-01"), `placeholder` and `disabled`.

- The popover shows a year and its twelve months. Arrows move between months (up and down by a row of three), Page Up / Page Down change the year, Home / End go to January / December, Enter picks.
- Month names come from the i18n locale; the current month is ringed, months outside `min` / `max` are struck through and can't be picked.
- `parseMonth` and `toMonthValue` are exported.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/month-picker` and import from `@/components/ui/month-picker`.
