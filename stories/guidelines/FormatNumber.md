# FormatNumber

Numbers written the way the reader's language writes them: "1 234,5 €" in French, "$1,234.50" in English, percentages, compact numbers (1.2K), file sizes (3.4 MB).

**The consumer provides** the `value` and a `format`: `decimal`, `integer`, `percent` (0.12 is 12%), `currency` (with `currency`, an ISO code), `compact`, `bytes` (with `base` 1000 or 1024) or `unit` (with an Intl `unit`). Optional: `minimumFractionDigits`, `maximumFractionDigits` and `signDisplay` (`exceptZero` writes +4.2%). `AnimatedNumber` takes the same props and counts up to its value; `formatValue(value, locale, options)` is the function.

- The locale comes from CoreloomI18nProvider; never build number strings by hand.
- Align figures in tables to the right; both components use tabular numbers.
- A compact number keeps its full value in a tooltip. Show the full value where people compare or copy it.
- Animate only the few headline figures of a dashboard. Screen readers and people who reduce motion get the final value at once.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/format` and import from `@/components/ui/format`.
