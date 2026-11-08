# Presence

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Who else is here, for collaborative screens: the people on the page, what they are doing, and their pointers. There is no transport: your app sends and receives presence (a websocket, Liveblocks, Yjs awareness, Supabase Realtime…) and passes it in.

**`PresenceAvatars` takes** `users` (`{ id, name, avatarUrl?, status?, activity?, color? }`; `status` is `active` or `idle`, dimmed), `max` (avatars before "+3", 4 by default) and `size` (`sm`, `default`, `lg`).

**`PresenceActivity` takes** `users` (the people doing something now), `verb(names, count)` for another action than editing, and `announce` (`true` by default: a polite status line; set it to `false` when the area already has a live region).

**`RemoteCursors` takes** `users` and `cursors` (`{ id, x, y }`, from 0 to 1 across the area) and wraps the area they move over. `cursorPosition(event, element)` turns a pointer event into the `{ x, y }` to send, so positions hold whatever each person's window size.

- Each person keeps one colour, theirs (`color`, a token such as `var(--chart-2)`) or one of the chart colours picked from their id, on their avatar ring and their cursor. `presenceColor(user)` gives it to your own marks (a selection, a caret).
- The avatars are focusable: the name and activity show on hover and focus. The group is named "3 people here" and lists everyone for screen readers, the counted ones included.
- Cursors are decorative and hidden from screen readers; say who is here with `PresenceAvatars`. They glide between updates, and jump under reduced motion. Throttle what you send (every 50 ms is plenty) and drop people who leave.
- "X is editing…" shows an animated dot trio while someone is active; keep it for real activity, and clear it a few seconds after their last keystroke.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/presence` and import from `@/components/ui/presence`.
