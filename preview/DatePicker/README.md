# DatePicker

A date field: a trigger that opens a `Calendar` in a `Popover` (shadcn's date-picker pattern).

**The consumer provides** `value` + `onValueChange` (a `Date` or `undefined`; or `defaultValue`), `placeholder`, `formatString` (date-fns, `"PPP"` by default: "November 3rd, 2026"), `locale` (date-fns), an `id` for its `FieldLabel`, and `calendarProps` for anything Calendar takes: `disabled` days, `startMonth` / `endMonth`, `locale`, `captionLayout="dropdown"`.

- The trigger matches `Input`, with a calendar icon in `fg-muted`. The placeholder is in `fg-muted`. Picking a day closes the popover and returns focus to the trigger.
- For another language, pass a date-fns `locale` (`import { fr } from "date-fns/locale"`). It formats the label and localizes the calendar.
- **`typing`** turns the trigger into a text input with a calendar button: people type "14/10/2026" in their locale's order (any separator, two-digit years, ISO and "Oct 14, 2026" work too), impossible dates (31/02) are refused with "Enter a date as dd/mm/yyyy", and the label shows the short form. Use it where people know the date already (a birth date, an invoice date); keep the picker alone where they browse (a booking).
- For one date in a form. For a range, compose `Popover` + `Calendar mode="range"`. For dates far in the past (birthdays), use `captionLayout="dropdown"`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/date-picker` and import from `@/components/ui/date-picker`._
