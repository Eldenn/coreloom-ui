# @coreloom/event-calendar

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/event-calendar.tsx

```ts
type CalendarEvent = {}
CalendarEvent.id: string
CalendarEvent.title: string
CalendarEvent.start: Date
CalendarEvent.end?: Date | undefined
CalendarEvent.allDay?: boolean | undefined
CalendarEvent.color?: 1 | 2 | 5 | 4 | 3 | undefined
function EventCalendar
EventCalendar.events: CalendarEvent[]
EventCalendar.month?: Date | undefined
EventCalendar.defaultMonth?: Date | undefined
EventCalendar.onMonthChange?: ((month: Date) => void) | undefined
EventCalendar.onEventSelect?: ((event: CalendarEvent) => void) | undefined
EventCalendar.onDaySelect?: ((day: Date) => void) | undefined
EventCalendar.maxPerDay?: number | undefined
EventCalendar.className?: string | undefined
```
