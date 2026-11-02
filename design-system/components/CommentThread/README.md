# CommentThread

A discussion under a document, a task, a design or a pull request: comments with their author and time, one level of replies, emoji reactions, "@" mentions and a box to write.

**The consumer provides** `comments` (`{ id, author: { name, avatar? }, body, createdAt, edited?, reactions?, replies? }`), and optionally `onSubmit(text, parentId?)` (without it, the thread is read only), `onReact(commentId, emoji)`, `currentUser`, `mentionables` (people "@" suggests, as for MentionTextarea) and `collapseRepliesAfter` (3). `CommentComposer` is the box alone.

- Reply opens a box under the comment; replies stay one level deep, which keeps long threads readable. Beyond `collapseRepliesAfter`, earlier replies fold behind "Show n replies".
- Reactions are toggle buttons that say the count and whether yours is among them; the smiley button adds one from the emoji picker.
- Ctrl or Cmd + Enter sends, Escape cancels a reply. Mentions of `mentionables` are drawn as mentions in the comments.
- It is front-end only: you store the comments, notify the people mentioned (`mentionsIn` from MentionTextarea lists them) and update the list.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/comment-thread` and import from `@/components/ui/comment-thread`._
