# Kanban

Columns of cards to reorder and move between: a sprint, a pipeline, a support queue.

**Install** `pnpm dlx shadcn@latest add @coreloom/kanban`. It writes `kanban.tsx` and installs dnd-kit.

**The consumer provides** `<KanbanBoard columns cards onCardsChange>`: `columns` are `{ id, title, limit? }`, `cards` are `{ id, columnId, title, description?, labels?, assignee? }` in display order. The board is controlled — save the new order in `onCardsChange`. Optional: `onCardOpen(card)` (the title becomes a button), `columnFooter(column)` (an "Add a card" button).

- Each card has a grip to drag it — with a pointer, or with the keyboard (Space to pick up, arrows to move, Space to drop, Escape to cancel), announced to screen readers in the reader's language. Its **⋯** menu offers **Move to** each other column, for anyone who'd rather not drag.
- Columns are `surface` panels with the count in mono; a `limit` shows "2 of 2" in `warning` when reached and `danger` past it. An empty column shows a dashed drop zone.
- Keep cards short: a title, at most one line of detail, labels and an assignee.
