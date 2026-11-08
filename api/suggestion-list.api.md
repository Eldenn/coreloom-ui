# @coreloom/suggestion-list

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/suggestion-list.tsx

```ts
type Suggestion = {}
Suggestion.id: string
Suggestion.text: string
Suggestion.label?: React.ReactNode
Suggestion.detail?: React.ReactNode
function SuggestionList
SuggestionList.suggestions: Suggestion[]
SuggestionList.onAccept: SuggestionHandler<[suggestion: Suggestion, text: string]>
SuggestionList.onDismiss: SuggestionHandler<[suggestion: Suggestion]>
SuggestionList.editable?: boolean | undefined
SuggestionList.renderText?: ((text: string) => React.ReactNode) | undefined
SuggestionList.empty?: React.ReactNode
SuggestionList.disabled?: boolean | undefined
SuggestionList.className?: string | undefined
SuggestionList.aria-label?: string | undefined
SuggestionList.aria-labelledby?: string | undefined
type SuggestionListProps = {}
SuggestionListProps.suggestions: Suggestion[]
SuggestionListProps.onAccept: SuggestionHandler<[suggestion: Suggestion, text: string]>
SuggestionListProps.onDismiss: SuggestionHandler<[suggestion: Suggestion]>
SuggestionListProps.editable?: boolean | undefined
SuggestionListProps.renderText?: ((text: string) => React.ReactNode) | undefined
SuggestionListProps.empty?: React.ReactNode
SuggestionListProps.disabled?: boolean | undefined
SuggestionListProps.className?: string | undefined
SuggestionListProps.aria-label?: string | undefined
SuggestionListProps.aria-labelledby?: string | undefined
```
