# @coreloom/relative-time

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/relative-time.tsx

```ts
function formatRelative(date: Date | string | number, locale: string, now?: Date | number, style?: Intl.RelativeTimeFormatStyle) => string
function RelativeTime
RelativeTime.date: string | number | Date
RelativeTime.now?: number | Date | undefined
RelativeTime.style?: (Intl.RelativeTimeFormatStyle & React.CSSProperties) | undefined
RelativeTime.live?: boolean | undefined
RelativeTime.*: react
```
