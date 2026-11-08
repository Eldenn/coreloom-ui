# @coreloom/mention-textarea

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/mention-textarea.tsx

```ts
type MentionOption = {}
MentionOption.value: string
MentionOption.label: string
MentionOption.description?: string | undefined
MentionOption.icon?: React.ReactNode
function mentionsIn(text: string, options: MentionOption[], trigger?: string) => string[]
function MentionTextarea
MentionTextarea.options: MentionOption[]
MentionTextarea.value?: string | undefined
MentionTextarea.defaultValue?: string | undefined
MentionTextarea.onValueChange?: ((text: string) => void) | undefined
MentionTextarea.trigger?: string | undefined
MentionTextarea.maxSuggestions?: number | undefined
MentionTextarea.rows?: number | undefined
MentionTextarea.placeholder?: string | undefined
MentionTextarea.disabled?: boolean | undefined
MentionTextarea.id?: string | undefined
MentionTextarea.name?: string | undefined
MentionTextarea.className?: string | undefined
MentionTextarea.onBlur?: (() => void) | undefined
MentionTextarea.aria-label?: string | undefined
MentionTextarea.aria-labelledby?: string | undefined
MentionTextarea.aria-describedby?: string | undefined
MentionTextarea.aria-invalid?: boolean | 'true' | 'false' | undefined
```
