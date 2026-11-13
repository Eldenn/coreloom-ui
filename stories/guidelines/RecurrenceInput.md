# RecurrenceInput

How often something repeats: a meeting every 2 weeks on Monday and Wednesday, an invoice on the 1st of each month, a backup every day until the end of the year.

**The consumer provides** `value` + `onValueChange` (`{ frequency: "day" | "week" | "month" | "year", interval, weekdays?, monthDay?, end }`, where `weekdays` are ISO days, 1 for Monday to 7 for Sunday, and `end` is `{ type: "never" }`, `{ type: "on", date: "YYYY-MM-DD" }` or `{ type: "after", count }`), an `id` for its `FieldLabel` (it goes on the interval), and optionally `frequencies` (the ones offered) and `disabled`.

- A sentence under the fields reads the rule back in the current language ("Every 2 weeks on Mon and Wed, 10 times"), so people can check it before saving. A weekly rule with no day says so.
- Weekdays are chips, named and ordered by the locale; the end ("Never", "On date", "After") is a RadioGroup, and the end date uses DatePicker.
- `toRRule(rule)` gives the iCalendar RRULE ("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=10") for calendars and schedulers, and `parseRRule(text)` reads one back (undefined when it holds parts this can't show).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/recurrence-input` and import from `@/components/ui/recurrence-input`.
