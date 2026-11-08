# LoadMore

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The end of a list or a feed that loads its next page: a **Load more** button, or infinite scroll that loads as the end comes into view.

**The consumer provides** `status` (`idle`, `loading`, `error` or `done`) and `onLoadMore`, which fetches the next page, plus optionally `auto` (infinite scroll, loading `rootMargin` before the end, 240px by default), `loaded` and `total` for the count under the button ("16 of 26"), `label` for the button and `endText` for the end (`null` hides it). With TanStack Query, `loadMoreStatus(query)` turns an infinite query into `status`: `<LoadMore auto status={loadMoreStatus(q)} onLoadMore={() => q.fetchNextPage()} />`.

- One button goes through every state: **Load more**, then **Loading more…** (it keeps focus, `aria-disabled` while it waits), then **Try again** after an error, with the error above it. Loading and errors are announced politely.
- With `auto`, the button stays: keyboard and screen reader users, and browsers without IntersectionObserver, still load with it. A short page that leaves the end in view loads the next one straight away.
- At the end the button gives way to "You’ve reached the end."; if it had focus, focus moves to that line.
- Put it after the list, inside the scrolling box if the list scrolls on its own. For thousands of rows in a fixed height, use VirtualList (it renders only what shows); for numbered pages, Pagination.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/load-more` and import from `@/components/ui/load-more`.
