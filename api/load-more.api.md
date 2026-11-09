# @coreloom/load-more

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/load-more.tsx

```ts
type InfiniteQueryLike = {}
InfiniteQueryLike.hasNextPage: boolean
InfiniteQueryLike.isFetchingNextPage: boolean
InfiniteQueryLike.isFetchNextPageError: boolean
function LoadMore
LoadMore.status: LoadMoreStatus
LoadMore.onLoadMore: () => unknown
LoadMore.auto?: boolean | undefined
LoadMore.rootMargin?: string | undefined
LoadMore.loaded?: number | undefined
LoadMore.total?: number | undefined
LoadMore.endText?: React.ReactNode
LoadMore.label?: React.ReactNode
LoadMore.className?: string | undefined
type LoadMoreStatus = 'done' | 'idle' | 'error' | 'loading'
function loadMoreStatus(query: InfiniteQueryLike) => LoadMoreStatus
```
