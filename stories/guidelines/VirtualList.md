# VirtualList

A long list — logs, events, search results, a feed — in a scrolling box where only the visible items are in the page (TanStack Virtual). Items can differ in height: they are measured as they render.

**The consumer provides** `items`, `renderItem(item, index)`, `getKey(item)`, the box `height` and an `aria-label` (or `aria-labelledby`), plus optionally:

- `estimateSize` (px before measuring, default 48), `overscan` and `gap`;
- `onEndReached`, `hasMore` and `loadingMore` to load the next page near the end — TanStack Query's `useInfiniteQuery` maps one to one (`fetchNextPage`, `hasNextPage`, `isFetchingNextPage`);
- `empty` for the empty state.

- The box is a labelled region in the tab order, so keyboard users can scroll it; focus shows the ring. Items are list items with `aria-posinset` and `aria-setsize` (−1 while more can load), so screen readers say "12 of 3,000".
- Loading more shows a spinner row at the end and announces "Loading more…"; once `hasMore` is false the last row reads "End of the list".
- Keep each row's content inside the row; a row that opens on click should be a button or a link inside the item.
- For tabular data with sorting and columns, use `DataTable` with `virtual` instead.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/virtual-list` and import from `@/components/ui/virtual-list`.
