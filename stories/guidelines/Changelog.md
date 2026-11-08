# Changelog

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A product's public changelog page: one entry per release with its date, version, title, a summary, an image or a video, and its changes tagged New, Improved, Fixed, Security or Deprecated. Chips filter by kind; older entries show on demand.

**The consumer provides** `<Changelog entries title description feedUrl onSubscribe pageSize kinds defaultKinds onKindsChange>`: `entries`, newest first, are `{ id, date, version?, title, summary?, media?, changes?, body? }` with `changes` `{ kind, text }[]` (`kind` one of new, improved, fixed, security, deprecated) and `body` anything else you render (rich text). `title` renders the page's main heading: leave it out when the page has one. `feedUrl` adds a "Feed" link, `onSubscribe` a "Subscribe to updates" button. `pageSize` defaults to 10.

- Each entry is an `<article>` with an `h2` and an anchor (`#<id>`) next to its title, to link to a release.
- Kinds are badges with their name in words, not colours alone.
- "Show older updates" reveals the next page and moves focus to its first entry.
- The filter (`kinds`) keeps only the entries with changes of those kinds; `filterChangelog` and `changeKinds` are exported for your own views (an RSS feed, a "What's new" dialog).
- Dates are formatted for the locale; give them in local time.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/changelog`.
