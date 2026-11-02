# Integrations

Connectable apps as cards, with search and category filters.

**Install** `pnpm dlx shadcn@latest add @coreloom/integrations`. It writes `integrations.tsx`.

**The consumer provides** `<Integrations integrations onConnect onConfigure onDisconnect>`: `{ id, name, description, logo?, category?, connected?, account?, unavailable? }`.

- `onConnect` runs your OAuth flow; return a promise to show progress. Disconnect is confirmed.
- `unavailable` disables Connect with a note.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Integrations`._
