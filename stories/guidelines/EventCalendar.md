# EventCalendar

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A month of events: releases, meetings, on-call shifts.

**Install** `pnpm dlx shadcn@latest add @coreloom/event-calendar`. It writes `event-calendar.tsx`.

**The consumer provides** `<EventCalendar events>` with `events` as `{ id, title, start, end?, allDay?, color? }` (`color` 1–5 picks `chart-1` … `chart-5`), and optionally `month` + `onMonthChange` (or `defaultMonth`), `onEventSelect(event)`, `onDaySelect(day)`, `maxPerDay` (3).

- Wide screens get a 7-column grid: weekday names in mono, today's number in a cyan disc, days outside the month on `surface`, events as dots with their time and title; a busy day shows "2 more", which expands in place and becomes "Show less".
- Phones get an agenda: one card per day that has events, with times; today's card says "Today".
- The month's name is a level-2 heading; changing month is announced through a polite status message. Day labels in the agenda are plain text, not headings.
- Weeks start on the locale's first day (Monday in French, Sunday in US English); month and day names come from the i18n `dateLocale`.
- For one date or a range in a form, use `DatePicker` or `DateRangePicker`; this is for reading a schedule.
