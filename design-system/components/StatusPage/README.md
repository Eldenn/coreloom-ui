# Status page

A public status page: the overall state, components with 90 days of uptime, ongoing incidents with their updates, and past incidents.

**Install** `pnpm dlx shadcn@latest add @coreloom/status-page`. It writes `status-page.tsx`.

**The consumer provides** `<StatusPage components incidents title updatedAt onSubscribe>`: components `{ id, name, status, group?, days? }`, incidents `{ id, title, impact, components?, updates: { stage, message, at }[] }`.

- The overall state is the worst component state. Resolved incidents go under Past incidents.
- The uptime bar is a slider: arrow keys read each day. `UptimeBar` and `IncidentTimeline` are exported.

_On `window.CoreloomUIDesignSystem_ff5f32` as `StatusPage`, `UptimeBar`, `IncidentTimeline`._
