# @coreloom/diagram-card

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/diagram-card.tsx

```ts
function DiagramCard
DiagramCard.title: string
DiagramCard.href: string
DiagramCard.diagram?: UmlSpec | undefined
DiagramCard.image?: string | undefined
DiagramCard.visibility: DiagramVisibility
DiagramCard.updatedAt: Date
DiagramCard.diagramCount?: number | undefined
DiagramCard.actions?: readonly DiagramCardAction[] | undefined
DiagramCard.className?: string | undefined
type DiagramCardAction = {}
DiagramCardAction.label: string
DiagramCardAction.icon?: React.ReactNode
DiagramCardAction.onSelect: () => void
DiagramCardAction.destructive?: boolean | undefined
DiagramCardAction.disabled?: boolean | undefined
type DiagramCardProps = {}
DiagramCardProps.title: string
DiagramCardProps.href: string
DiagramCardProps.diagram?: UmlSpec | undefined
DiagramCardProps.image?: string | undefined
DiagramCardProps.visibility: DiagramVisibility
DiagramCardProps.updatedAt: Date
DiagramCardProps.diagramCount?: number | undefined
DiagramCardProps.actions?: readonly DiagramCardAction[] | undefined
DiagramCardProps.className?: string | undefined
type DiagramVisibility = 'public' | 'private' | 'protected'
```
