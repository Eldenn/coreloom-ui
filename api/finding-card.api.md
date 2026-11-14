# @coreloom/finding-card

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/finding-card.tsx

```ts
function FindingCard
FindingCard.title: string
FindingCard.status: FindingStatus
FindingCard.statusLabel?: string | undefined
FindingCard.severity?: FindingSeverity | undefined
FindingCard.comment?: string | undefined
FindingCard.evidence?: readonly FindingEvidence[] | undefined
FindingCard.resolution?: FindingResolution | undefined
FindingCard.defaultResolution?: FindingResolution | undefined
FindingCard.onResolutionChange?: ((resolution: FindingResolution) => void) | undefined
FindingCard.onSelect?: (() => void) | undefined
FindingCard.selected?: boolean | undefined
FindingCard.disabled?: boolean | undefined
FindingCard.className?: string | undefined
type FindingCardProps = {}
FindingCardProps.title: string
FindingCardProps.status: FindingStatus
FindingCardProps.statusLabel?: string | undefined
FindingCardProps.severity?: FindingSeverity | undefined
FindingCardProps.comment?: string | undefined
FindingCardProps.evidence?: readonly FindingEvidence[] | undefined
FindingCardProps.resolution?: FindingResolution | undefined
FindingCardProps.defaultResolution?: FindingResolution | undefined
FindingCardProps.onResolutionChange?: ((resolution: FindingResolution) => void) | undefined
FindingCardProps.onSelect?: (() => void) | undefined
FindingCardProps.selected?: boolean | undefined
FindingCardProps.disabled?: boolean | undefined
FindingCardProps.className?: string | undefined
type FindingEvidence = {}
FindingEvidence.path: string
FindingEvidence.line?: number | undefined
FindingEvidence.href?: string | undefined
type FindingResolution = 'done' | 'open' | 'dismissed'
type FindingSeverity = 'low' | 'medium' | 'high'
type FindingStatus = 'error' | 'warning' | 'ok' | 'unknown'
```
