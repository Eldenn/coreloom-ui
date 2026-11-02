# Time Picker

A time of day. People type it ("14:30", "2:30 pm", "1430", "14h30") or pick it from a list, and it is shown in the reader's clock: 2:30 PM in English, 14:30 in French. `DateTimePicker` puts a `DatePicker` and a `TimePicker` side by side for one `Date`.

**The consumer provides** for `TimePicker`: `value` + `onValueChange` (an `"HH:mm"` string in 24-hour time — the same as `<input type="time">` — or `undefined`; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `step` (minutes between listed times, 30), `min` / `max` (first and last listed times, `"08:00"`), `locale` (defaults to the i18n locale) and `placeholder` (defaults to the expected shape, "hh:mm AM/PM" or "hh:mm").

For `DateTimePicker`: `value` + `onValueChange` (a `Date` or `undefined`), `id` (goes on the day part), `defaultTime` (used when a day is picked first, `"09:00"`), `step`, `minTime` / `maxTime`, `dateLocale` (date-fns) and `locale`, `calendarProps`, and `aria-label` for the whole group.

- The clock button opens a list of times: ↑ / ↓, Page Up / Page Down, Home / End move, a digit jumps to that hour, Enter picks; focus goes back to the field. Typed times can be any minute, not only listed ones.
- A time that can't be read marks the field invalid and says the expected shape under it; the value becomes `undefined`.
- `min` / `max` only shape the list. Validate a range ("closes after it opens") in your form.
- In `DateTimePicker`, picking a day keeps the time and changing the time keeps the day; the time part is named "Time" (i18n), and the day part "Date" unless an `id` links a label to it.
- Store the time as the string, or join it to a date with your own timezone rules; the component never converts timezones.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/time-picker` and import from `@/components/ui/time-picker`.
