# Calendar

A month grid for picking a date or a range, built on react-day-picker 9.

**The consumer provides** `mode` (`single`, `multiple`, `range`), `selected` + `onSelect`, and any react-day-picker option: `disabled` days, `startMonth` / `endMonth`, `numberOfMonths`, `captionLayout="dropdown"`, `locale`, `weekStartsOn`.

- `surface-1` (transparent inside a Popover or a Card). Caption in `font-display` 15px / 600, weekdays mono 11px uppercase, 36px day cells. Selected days fill `accent` with `fg-on-accent`. Range middles use `accent-subtle` with `accent-fg`. Today is bold `accent-fg` with a `border-strong` ring. Outside days are `fg-muted`, disabled days struck through in `fg-faint`.
- Day buttons are named with the day's number as a word ("Sunday 27 September 2026"), plus "Today" and "selected", so speech input matches what's on screen. Override with `labels`.
- Arrow keys move by day, Page Up / Down by month, Home / End to the week's ends (react-day-picker).
- As a field, use `DatePicker`. Show the calendar inline only where picking dates is the page's job (bookings, reports).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/calendar` and import from `@/components/ui/calendar`.
