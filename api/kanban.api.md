# @coreloom/kanban

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/kanban.tsx

```ts
function KanbanBoard
KanbanBoard.columns: KanbanColumn[]
KanbanBoard.cards: KanbanCard[]
KanbanBoard.onCardsChange: (cards: KanbanCard[]) => void
KanbanBoard.onCardOpen?: ((card: KanbanCard) => void) | undefined
KanbanBoard.columnFooter?: ((column: KanbanColumn) => React.ReactNode) | undefined
KanbanBoard.className?: string | undefined
type KanbanCard = {}
KanbanCard.id: string
KanbanCard.columnId: string
KanbanCard.title: string
KanbanCard.description?: React.ReactNode
KanbanCard.labels?: { label: string; tone?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; }[] | undefined
KanbanCard.assignee?: {}
KanbanCard.assignee.name: string
KanbanCard.assignee.avatar?: string | undefined
type KanbanColumn = {}
KanbanColumn.id: string
KanbanColumn.title: string
KanbanColumn.limit?: number | undefined
```
