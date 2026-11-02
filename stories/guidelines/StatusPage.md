# Status page

A public status page: the overall state at the top (the worst state of any component), ongoing incidents with their updates, each component with its state and 90 days of uptime, and past incidents.

**The consumer provides** `<StatusPage components incidents title updatedAt onSubscribe>`: `components` are `{ id, name, description?, status, group?, days?, uptime? }` with `status` one of operational, degraded, partial, major, maintenance, and `days` one `{ date, uptime?, status?, incidents? }` per day, oldest first (a day without `uptime` shows as "no data"). `incidents` are `{ id, title, impact, components?, updates }`, each update `{ stage, message, at }` (investigating, identified, monitoring, resolved; or scheduled, inProgress, verifying, completed for maintenance). An incident whose latest update is resolved or completed goes under Past incidents. `onSubscribe` shows Subscribe to updates.

- The uptime bar is a slider: Tab to it, then Left / Right (Home / End) read each day aloud with its uptime and incidents; hovering shows the same line under the bar. Phones show the last 30 days.
- A day's colour comes from its uptime (99.9% and up is green) unless you set its `status`. Every state is also written in words.
- Past incidents show their duration and open to their timeline.
- `UptimeBar` and `IncidentTimeline` are exported for a service card or an admin incident page.
- Compute uptime and states on your side; the block only displays them.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/status-page`.
