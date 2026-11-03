# Audit log

Who did what, and when: one row per event, grouped by day, with the actor (a person, an API key or the platform), the action, its target, the IP address and place, and the event's details as JSON.

**The consumer provides** `<AuditLog events actions hasMore loading onLoadMore onExport title>`: `events` are `{ id, actor: { name, email?, avatar?, type? }, action, target?, at, ip?, location?, metadata? }`; `actions` are `{ value, label }`, the words for each action key ("member.invited" → "invited"), also used by the action filter. `onExport(events)` receives the events that match the filters.

- Search looks through the actor, action, target and IP; the actor and action filters narrow further. The number of results is announced.
- A row with `metadata` opens to show it.
- Load more appears with `hasMore` and shows a spinner while `loading`; pass pages from your API as they come.
- Filtering is done on the events you pass. For a log too big to load, filter on your server and pass the result.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/audit-log`.
