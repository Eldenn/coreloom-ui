# @coreloom/prompt-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/prompt-input.tsx

```ts
function PromptInput
PromptInput.onSubmit: (message: { text: string; files: File[]; }) => void
PromptInput.onStop?: (() => void) | undefined
PromptInput.status?: AiChatStatus | undefined
PromptInput.value?: string | undefined
PromptInput.defaultValue?: string | undefined
PromptInput.onValueChange?: ((value: string) => void) | undefined
PromptInput.placeholder?: string | undefined
PromptInput.accept?: string | undefined
PromptInput.allowAttachments?: boolean | undefined
PromptInput.toolbar?: React.ReactNode
PromptInput.disabled?: boolean | undefined
PromptInput.autoFocus?: boolean | undefined
PromptInput.className?: string | undefined
```
