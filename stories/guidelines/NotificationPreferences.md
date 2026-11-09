# Notification preferences

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Which notifications someone gets, and where: a grid of events (grouped under headings) by channels — e-mail, push, in-app — with a checkbox in each cell and one per channel to switch it for every event.

**The consumer provides** `events` (`{ id, label, description?, group?, required?, unavailable? }`), `channels` (`{ id, label }`) and the value, `{ [eventId]: channelIds[] }`: `value` + `onValueChange` (or `defaultValue`), plus optionally `disabled`, `title` and `description`.

- `required` channels are ticked and locked (security alerts by e-mail), with a line under the grid saying why; `unavailable` ones show a dash and no checkbox.
- The checkbox at the top of a channel turns it on for every event that offers it, or off when it was on everywhere; it is half-ticked when some are on.
- It is a real table: each checkbox is named by its event and channel ("Mentions by E-mail"), and the group headings span the row.
- Save in `onValueChange` (it gets the whole value) for an autosaving page, or keep the value and save from your own button. `setNotificationChannel` and `setNotificationChannelForAll` are the same changes as plain functions.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/notification-preferences`.
