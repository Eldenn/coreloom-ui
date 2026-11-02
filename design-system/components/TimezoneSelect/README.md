# TimezoneSelect

A searchable list of time zones with their UTC offsets: for a profile, a workspace, a scheduled job.

**The consumer provides** `value` + `onValueChange` (an IANA name such as "Europe/Paris"), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `timeZones` (a subset; every zone the browser knows by default), `date` (the day the offsets are worked out for, today by default), `placeholder`, `clearable` and `disabled`.

- Each zone reads "(UTC+01:00) Paris", sorted by offset. Search finds a city, a region or an offset ("paris", "europe", "+9"), and the person's own zone is marked.
- Offsets follow daylight saving for `date`, so a meeting planned for January shows winter offsets.
- It is a Combobox underneath: same trigger, keyboard and `clearable`. `timeZoneOffset` and `formatOffset` are exported for your own labels.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/timezone-select` and import from `@/components/ui/timezone-select`._
