'use client'

// Coreloom UI — CodeReview. A pull request's changes to review: the changed files in a tree, each
// file's diff (unified or side by side) with a comment button on every line, the comment threads
// under their lines (reply, resolve), "Viewed" per file, and "Finish review" with a verdict and a
// summary. Front-end only: you pass the files and threads and keep them up to date from the
// callbacks.
//
//   <CodeReview files={files} threads={threads} currentUser={me}
//     onComment={(c) => addThread(c)} onReply={(id, body) => reply(id, body)}
//     onResolve={(id, resolved) => setResolved(id, resolved)}
//     onSubmitReview={(review) => api.submit(review)} />
import { FolderTreeIcon } from 'lucide-react'
import * as React from 'react'

import { LineCounts, type ReviewDiscussion, ReviewFileView } from '@/components/code-review-file'
import {
  type ReviewFile,
  type ReviewLayout,
  reviewStats,
  type ReviewSubmission,
  type ReviewThread,
} from '@/components/code-review-model'
import { FinishReview } from '@/components/code-review-submit'
import { ReviewFileTree } from '@/components/code-review-tree'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A value the parent may own (`value` set) or leave to the block (`defaultValue`). */
function useControlled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const set = (next: T) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set]
}

type CodeReviewProps = ReviewDiscussion & {
  files: ReviewFile[]
  /** Comment threads on the files' lines. Default none. */
  threads?: ReviewThread[]
  /** Paths marked as viewed (controlled). A viewed file starts folded. */
  viewed?: string[]
  defaultViewed?: string[]
  onViewedChange?: (viewed: string[]) => void
  /** Unified (one column) or split (before and after side by side). */
  layout?: ReviewLayout
  /** Default `unified`. */
  defaultLayout?: ReviewLayout
  onLayoutChange?: (layout: ReviewLayout) => void
  /** Sends the review. While the promise is pending the button spins; a rejection is shown. */
  onSubmitReview?: (review: ReviewSubmission) => void | Promise<void>
  /** Long lines wrap instead of scrolling sideways. */
  wrap?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * Moves to a file after the render that opens it: scrolls to it and puts focus on its header.
 * Call it from an event that also changes state, so a render follows.
 */
function useGoToFile(fileIds: Map<string, string>) {
  const target = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!target.current) return
    const button = document.getElementById(fileIds.get(target.current) ?? '')
    target.current = null
    button?.closest('section')?.scrollIntoView({ block: 'start' })
    button?.focus({ preventScroll: true })
  })
  return (path: string) => {
    target.current = path
  }
}

function CodeReview({
  files,
  threads = [],
  viewed: viewedProp,
  defaultViewed = [],
  onViewedChange,
  layout: layoutProp,
  defaultLayout = 'unified',
  onLayoutChange,
  onSubmitReview,
  wrap,
  className,
  'aria-label': ariaLabel,
  ...discussion
}: CodeReviewProps) {
  const t = useCoreloomI18n().messages.codeReview
  const id = React.useId()
  const [viewedList, setViewedList] = useControlled(viewedProp, defaultViewed, onViewedChange)
  const viewed = React.useMemo(() => new Set(viewedList), [viewedList])
  const [layout, setLayout] = useControlled(layoutProp, defaultLayout, onLayoutChange)
  // Files the person opened or closed by hand; the others are open unless viewed.
  const [openState, setOpenState] = React.useState<Readonly<Record<string, boolean>>>({})
  const [active, setActive] = React.useState<string | null>(files.at(0)?.path ?? null)
  const [treeOpen, setTreeOpen] = React.useState(false)
  const stats = React.useMemo(() => reviewStats(files), [files])
  const fileIds = React.useMemo(
    () => new Map(files.map((f, i) => [f.path, `${id}-file-${String(i)}`])),
    [files, id],
  )
  const goTo = useGoToFile(fileIds)

  const setOpen = (path: string, open: boolean) => {
    setOpenState((prev) => ({ ...prev, [path]: open }))
  }
  const setViewed = (path: string, on: boolean) => {
    // Marking a file viewed folds it; unmarking opens it again.
    setOpenState((prev) => ({ ...prev, [path]: !on }))
    setViewedList(on ? [...viewedList, path] : viewedList.filter((p) => p !== path))
  }
  const openFile = (path: string) => {
    setActive(path)
    setOpen(path, true)
    setTreeOpen(false)
    goTo(path)
  }

  return (
    <section
      aria-label={ariaLabel ?? t.label}
      data-slot="code-review"
      className={cn('@container min-w-0 rounded-lg border border-border bg-background', className)}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={treeOpen}
          aria-controls={`${id}-tree`}
          className="@3xl:hidden"
          onClick={() => {
            setTreeOpen((value) => !value)
          }}
        >
          <FolderTreeIcon aria-hidden />
          {t.files}
        </Button>
        <p className="m-0 flex flex-wrap items-center gap-x-2 text-[13px] text-foreground">
          {t.filesChanged(stats.files)}
          <LineCounts added={stats.added} removed={stats.removed} />
        </p>
        <p className="m-0 text-[13px] text-muted-foreground">
          {t.viewedCount(files.filter((f) => viewed.has(f.path)).length, files.length)}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SegmentedControl
            size="sm"
            aria-label={t.layout}
            value={layout}
            onValueChange={(value) => {
              setLayout(value === 'split' ? 'split' : 'unified')
            }}
            options={[
              { value: 'unified', label: t.unified },
              { value: 'split', label: t.split },
            ]}
          />
          {onSubmitReview ? <FinishReview onSubmit={onSubmitReview} /> : null}
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 @3xl:grid-cols-[240px_minmax(0,1fr)]">
        <div
          id={`${id}-tree`}
          className={cn(
            'min-w-0 border-b border-border p-2 @3xl:block @3xl:border-r @3xl:border-b-0',
            !treeOpen && 'hidden',
          )}
        >
          <p
            id={`${id}-files`}
            className="m-0 px-2 pt-1 pb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            {t.files}
          </p>
          <ReviewFileTree
            files={files}
            threads={threads}
            viewed={viewed}
            active={active}
            labelledBy={`${id}-files`}
            onSelectFile={setActive}
            onOpenFile={openFile}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3 p-3">
          {files.length === 0 ? (
            <p className="m-0 p-4 text-[13.5px] text-muted-foreground">{t.noChanges}</p>
          ) : null}
          {files.map((file) => (
            <ReviewFileView
              key={file.path}
              file={file}
              threads={threads}
              layout={layout}
              wrap={wrap}
              viewed={viewed.has(file.path)}
              onViewedChange={(on) => {
                setViewed(file.path, on)
              }}
              open={openState[file.path] ?? !viewed.has(file.path)}
              onOpenChange={(open) => {
                setOpen(file.path, open)
              }}
              toggleId={fileIds.get(file.path) ?? ''}
              discussion={discussion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { CodeReview, type CodeReviewProps }
export {
  diffStats,
  fileStats,
  lineAnchor,
  type ReviewCommentInput,
  type ReviewFile,
  type ReviewFileStatus,
  type ReviewLayout,
  type ReviewSide,
  reviewStats,
  type ReviewSubmission,
  type ReviewThread,
  reviewTree,
  type ReviewTreeNode,
  type ReviewVerdict,
} from '@/components/code-review-model'
