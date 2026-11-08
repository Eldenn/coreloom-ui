# @coreloom/comment-thread

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/comment-thread.tsx

```ts
type CommentAuthor = {}
CommentAuthor.name: string
CommentAuthor.avatar?: string | undefined
function CommentComposer
CommentComposer.onSubmit: (text: string) => void
CommentComposer.onCancel?: (() => void) | undefined
CommentComposer.placeholder?: string | undefined
CommentComposer.submitLabel?: string | undefined
CommentComposer.mentionables?: MentionOption[] | undefined
CommentComposer.autoFocus?: boolean | undefined
CommentComposer.author?: CommentAuthor | undefined
CommentComposer.aria-label?: string | undefined
type CommentData = {}
CommentData.id: string
CommentData.author: CommentAuthor
CommentData.body: string
CommentData.createdAt: string | number | Date
CommentData.edited?: boolean | undefined
CommentData.reactions?: CommentReaction[] | undefined
CommentData.replies?: CommentData[] | undefined
type CommentReaction = {}
CommentReaction.emoji: string
CommentReaction.count: number
CommentReaction.reacted?: boolean | undefined
function CommentThread
CommentThread.comments: CommentData[]
CommentThread.currentUser?: CommentAuthor | undefined
CommentThread.mentionables?: MentionOption[] | undefined
CommentThread.onSubmit?: ((text: string, parentId?: string) => void) | undefined
CommentThread.onReact?: ((commentId: string, emoji: string) => void) | undefined
CommentThread.collapseRepliesAfter?: number | undefined
CommentThread.now?: number | Date | undefined
CommentThread.className?: string | undefined
CommentThread.aria-label?: string | undefined
```
