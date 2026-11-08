# LoadMore

The end of a list or a feed that loads its next page: a Load more button, or infinite scroll with `auto`.

**Install** `pnpm dlx shadcn@latest add @coreloom/load-more`. Experimental.

**The consumer provides** `status` (`idle`, `loading`, `error`, `done`) and `onLoadMore`; optionally `auto`, `loaded` / `total`, `label`, `endText`. `loadMoreStatus(query)` reads a TanStack infinite query.

- One button through every state (Load more, Loading more…, Try again), so focus stays on it.

_On `window.CoreloomUIDesignSystem_ff5f32` as `LoadMore`._
