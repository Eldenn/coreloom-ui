'use client'

// Coreloom UI — LoadMore. The end of a list or a feed that loads its next page: a "Load more" button,
// or, with `auto`, loading as the end scrolls into view (infinite scroll) with the button kept as the
// keyboard and fallback path. Your app fetches: pass its state as `status` and fetch in `onLoadMore`.
// It pairs with TanStack Query's useInfiniteQuery:
//
//   const q = useInfiniteQuery(…)
//   <LoadMore auto status={loadMoreStatus(q)} onLoadMore={() => q.fetchNextPage()} />
//
// For thousands of rows in a fixed-height box, use VirtualList instead: it only renders what shows.
import { RotateCwIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** `idle`: more can load. `loading`: a page is on its way. `error`: the last page failed. `done`: nothing left. */
type LoadMoreStatus = 'idle' | 'loading' | 'error' | 'done'

/** The fields of a TanStack infinite query this reads. */
interface InfiniteQueryLike {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
}

/** A TanStack infinite query's state as a LoadMore `status`. */
function loadMoreStatus(query: InfiniteQueryLike): LoadMoreStatus {
  if (query.isFetchingNextPage) return 'loading'
  if (query.isFetchNextPageError) return 'error'
  return query.hasNextPage ? 'idle' : 'done'
}

/** Calls `onVisible` while the element is on screen (within `rootMargin`), if `enabled`. */
function useWhenVisible<T extends Element>(
  enabled: boolean,
  onVisible: () => void,
  rootMargin: string,
) {
  const ref = React.useRef<T>(null)
  const callback = React.useEffectEvent(onVisible)
  React.useEffect(() => {
    const node = ref.current
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return
    // A new observer per page: if the end is still in view after a page lands (a short page),
    // it fires again at once and the next page loads, until the view is full.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) callback()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [enabled, rootMargin])
  return ref
}

function buttonText(status: LoadMoreStatus, t: { loading: string; retry: string }) {
  if (status === 'loading') return t.loading
  return status === 'error' ? t.retry : null
}

/** One button through idle, loading and error (Try again), so focus stays on it. */
function LoadMoreButton({
  status,
  label,
  onLoadMore,
  onFocusChange,
}: {
  status: Exclude<LoadMoreStatus, 'done'>
  label: React.ReactNode
  onLoadMore: () => unknown
  onFocusChange: (focused: boolean) => void
}) {
  const t = useCoreloomI18n().messages.loadMore
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      // aria-disabled, not disabled: a disabled button would drop focus while the page loads.
      aria-disabled={status === 'loading' || undefined}
      onFocus={() => {
        onFocusChange(true)
      }}
      onBlur={() => {
        onFocusChange(false)
      }}
      onClick={() => {
        if (status !== 'loading') void onLoadMore()
      }}
    >
      {status === 'loading' && <Spinner aria-hidden role={undefined} aria-label={undefined} />}
      {status === 'error' && <RotateCwIcon aria-hidden />}
      {buttonText(status, t) ?? label ?? t.loadMore}
    </Button>
  )
}

function LoadMore({
  status,
  onLoadMore,
  auto = false,
  rootMargin = '240px',
  loaded,
  total,
  endText,
  label,
  className,
}: {
  status: LoadMoreStatus
  /** Fetch the next page. Called on a click, or as the end comes into view with `auto`. */
  onLoadMore: () => unknown
  /** Load as the end scrolls into view (infinite scroll). The button stays for the keyboard. */
  auto?: boolean
  /** How far before the end `auto` starts loading (an IntersectionObserver root margin). */
  rootMargin?: string
  /** Items shown so far; with `total`, the count "20 of 134" sits under the button. */
  loaded?: number
  total?: number
  /** Shown when nothing is left (default "You’ve reached the end."). Pass null to hide it. */
  endText?: React.ReactNode
  /** The button's text (default "Load more"). */
  label?: React.ReactNode
  className?: string
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.loadMore
  const sentinel = useWhenVisible<HTMLDivElement>(auto && status === 'idle', onLoadMore, rootMargin)
  const endRef = React.useRef<HTMLParagraphElement>(null)
  const buttonHadFocus = React.useRef(false)

  // The button goes away at the end of the list: move focus to the message, not to <body>.
  React.useEffect(() => {
    if (status === 'done' && buttonHadFocus.current) {
      buttonHadFocus.current = false
      endRef.current?.focus()
    }
  }, [status])

  const count =
    loaded !== undefined && total !== undefined && status !== 'done'
      ? t.count(formatNumber(loaded), formatNumber(total))
      : null
  const end = endText === undefined ? t.end : endText

  return (
    <div
      data-slot="load-more"
      data-status={status}
      aria-busy={status === 'loading' || undefined}
      className={cn('flex flex-col items-center gap-2 py-4 text-center', className)}
    >
      <div ref={sentinel} aria-hidden className="h-px w-full" />
      {status === 'error' && <p className="m-0 text-[13px] text-destructive">{t.error}</p>}
      {status === 'done' ? (
        end !== null && (
          <p
            ref={endRef}
            tabIndex={-1}
            className="m-0 text-[12.5px] text-muted-foreground outline-none"
          >
            {end}
          </p>
        )
      ) : (
        <LoadMoreButton
          status={status}
          label={label}
          onLoadMore={onLoadMore}
          onFocusChange={(focused) => {
            buttonHadFocus.current = focused
          }}
        />
      )}
      {count && <p className="m-0 text-[12px] text-muted-foreground">{count}</p>}
      <span role="status" className="sr-only">
        {status === 'loading' ? t.loading : ''}
        {status === 'error' ? t.error : ''}
      </span>
    </div>
  )
}

export { type InfiniteQueryLike, LoadMore, type LoadMoreStatus, loadMoreStatus }
