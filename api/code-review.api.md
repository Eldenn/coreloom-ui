# @coreloom/code-review

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/code-review.tsx

```ts
function CodeReview
CodeReview.currentUser?: import("./ui/comment-thread").CommentAuthor | undefined
CodeReview.mentionables?: import("./ui/mention-textarea").MentionOption[] | undefined
CodeReview.now?: number | Date | undefined
CodeReview.onComment?: ((comment: import("@/components/code-review-model").ReviewCommentInput) => void) | undefined
CodeReview.onReply?: ((threadId: string, body: string) => void) | undefined
CodeReview.onResolve?: ((threadId: string, resolved: boolean) => void) | undefined
CodeReview.files: ReviewFile[]
CodeReview.threads?: ReviewThread[] | undefined
CodeReview.viewed?: string[] | undefined
CodeReview.defaultViewed?: string[] | undefined
CodeReview.onViewedChange?: ((viewed: string[]) => void) | undefined
CodeReview.layout?: ReviewLayout | undefined
CodeReview.defaultLayout?: ReviewLayout | undefined
CodeReview.onLayoutChange?: ((layout: ReviewLayout) => void) | undefined
CodeReview.onSubmitReview?: ((review: ReviewSubmission) => void | Promise<void>) | undefined
CodeReview.wrap?: boolean | undefined
CodeReview.className?: string | undefined
CodeReview.aria-label?: string | undefined
type CodeReviewProps = ReviewDiscussion & { files: ReviewFile[]; threads?: ReviewThread[]; viewed?: string[]; defaultViewed?: string[]; onViewedChange?: (viewed: string[]) => void; layout?: ReviewLayout; defaultLayout?: ReviewLayout; onLayoutChange?: (layout: ReviewLayout) => void; onSubmitReview?: (review: ReviewSubmission) => void | Promise<void>; wrap?: boolean; className?: string; 'aria-label'?: string; }
function diffStats(lines: readonly DiffLine[]) => DiffStats
function fileStats(file: ReviewFile) => DiffStats
function lineAnchor(line: DiffLine) => { side: ReviewSide; line: number; }
type ReviewCommentInput = {}
ReviewCommentInput.path: string
ReviewCommentInput.line: number
ReviewCommentInput.side: ReviewSide
ReviewCommentInput.body: string
type ReviewFile = {}
ReviewFile.path: string
ReviewFile.status: ReviewFileStatus
ReviewFile.oldPath?: string | undefined
ReviewFile.before: string
ReviewFile.after: string
type ReviewFileStatus = 'modified' | 'added' | 'deleted' | 'renamed'
type ReviewLayout = 'unified' | 'split'
type ReviewSide = 'new' | 'old'
function reviewStats(files: readonly ReviewFile[]) => DiffStats & { files: number; }
type ReviewSubmission = {}
ReviewSubmission.verdict: ReviewVerdict
ReviewSubmission.body: string
type ReviewThread = {}
ReviewThread.id: string
ReviewThread.path: string
ReviewThread.line: number
ReviewThread.side: ReviewSide
ReviewThread.resolved?: boolean | undefined
ReviewThread.comments: CommentData[]
function reviewTree(paths: readonly string[]) => ReviewTreeNode[]
type ReviewTreeNode = {}
ReviewTreeNode.id: string
ReviewTreeNode.name: string
ReviewTreeNode.path?: string | undefined
ReviewTreeNode.children?: ReviewTreeNode[] | undefined
type ReviewVerdict = 'approve' | 'comment' | 'request-changes'
```

## src/components/code-review-model.ts

```ts
type DiffStats = {}
DiffStats.added: number
DiffStats.removed: number
function diffStats(lines: readonly DiffLine[]) => DiffStats
function fileStats(file: ReviewFile) => DiffStats
function lineAnchor(line: DiffLine) => { side: ReviewSide; line: number; }
function outdatedThreads(byAnchor: Map<string, ReviewThread[]>, lines: readonly DiffLine[]) => ReviewThread[]
type ReviewCommentInput = {}
ReviewCommentInput.path: string
ReviewCommentInput.line: number
ReviewCommentInput.side: ReviewSide
ReviewCommentInput.body: string
type ReviewFile = {}
ReviewFile.path: string
ReviewFile.status: ReviewFileStatus
ReviewFile.oldPath?: string | undefined
ReviewFile.before: string
ReviewFile.after: string
type ReviewFileStatus = 'modified' | 'added' | 'deleted' | 'renamed'
type ReviewLayout = 'unified' | 'split'
type ReviewSide = 'new' | 'old'
function reviewStats(files: readonly ReviewFile[]) => DiffStats & { files: number; }
type ReviewSubmission = {}
ReviewSubmission.verdict: ReviewVerdict
ReviewSubmission.body: string
type ReviewThread = {}
ReviewThread.id: string
ReviewThread.path: string
ReviewThread.line: number
ReviewThread.side: ReviewSide
ReviewThread.resolved?: boolean | undefined
ReviewThread.comments: CommentData[]
function reviewTree(paths: readonly string[]) => ReviewTreeNode[]
type ReviewTreeNode = {}
ReviewTreeNode.id: string
ReviewTreeNode.name: string
ReviewTreeNode.path?: string | undefined
ReviewTreeNode.children?: ReviewTreeNode[] | undefined
type ReviewVerdict = 'approve' | 'comment' | 'request-changes'
function threadsByAnchor(threads: readonly ReviewThread[], path: string) => Map<string, ReviewThread[]>
function threadsForLine(byAnchor: Map<string, ReviewThread[]>, line: DiffLine) => ReviewThread[]
```

## src/components/code-review-file.tsx

```ts
function LineCounts
LineCounts.added: number
LineCounts.removed: number
type ReviewDiscussion = {}
ReviewDiscussion.currentUser?: CommentAuthor | undefined
ReviewDiscussion.mentionables?: MentionOption[] | undefined
ReviewDiscussion.now?: number | Date | undefined
ReviewDiscussion.onComment?: ((comment: ReviewCommentInput) => void) | undefined
ReviewDiscussion.onReply?: ((threadId: string, body: string) => void) | undefined
ReviewDiscussion.onResolve?: ((threadId: string, resolved: boolean) => void) | undefined
function ReviewFileView
ReviewFileView.file: ReviewFile
ReviewFileView.threads: readonly ReviewThread[]
ReviewFileView.layout: ReviewLayout
ReviewFileView.wrap?: boolean | undefined
ReviewFileView.viewed: boolean
ReviewFileView.onViewedChange: (viewed: boolean) => void
ReviewFileView.open: boolean
ReviewFileView.onOpenChange: (open: boolean) => void
ReviewFileView.toggleId: string
ReviewFileView.discussion: ReviewDiscussion
function StatusMark
StatusMark.status: ReviewFileStatus
StatusMark.className?: string | undefined
```

## src/components/code-review-tree.tsx

```ts
function ReviewFileTree
ReviewFileTree.files: readonly ReviewFile[]
ReviewFileTree.threads: readonly ReviewThread[]
ReviewFileTree.viewed: ReadonlySet<string>
ReviewFileTree.active: string | null
ReviewFileTree.onSelectFile: (path: string) => void
ReviewFileTree.onOpenFile: (path: string) => void
ReviewFileTree.labelledBy: string
```

## src/components/code-review-submit.tsx

```ts
function FinishReview
FinishReview.onSubmit: (review: ReviewSubmission) => void | Promise<void>
```
