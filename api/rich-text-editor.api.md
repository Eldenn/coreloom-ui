# @coreloom/rich-text-editor

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/rich-text-editor.tsx

```ts
type RichTextAiAction = 'improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'translate' | 'summarise' | 'continue' | 'custom'
type RichTextAiCommand = {}
RichTextAiCommand.action: RichTextAiAction
RichTextAiCommand.prompt?: string | undefined
RichTextAiCommand.language?: string | undefined
type RichTextAiOptions = {}
RichTextAiOptions.onRequest: (request: RichTextAiRequest) => AsyncIterable<string> | Promise<string>
RichTextAiOptions.actions?: ('improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'translate' | 'summarise')[] | undefined
RichTextAiOptions.languages?: string[] | undefined
RichTextAiOptions.defaultOpen?: boolean | RichTextAiCommand | undefined
RichTextAiOptions.slashCommand?: boolean | RichTextAiSlashAction[] | undefined
RichTextAiOptions.review?: boolean | undefined
type RichTextAiRequest = RichTextAiCommand & { text: string; scope: 'selection' | 'document'; signal: AbortSignal; }
type RichTextAiSlashAction = 'improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'summarise' | 'continue'
function RichTextEditor
RichTextEditor.value?: string | undefined
RichTextEditor.defaultValue?: string | undefined
RichTextEditor.onValueChange?: ((html: string) => void) | undefined
RichTextEditor.placeholder?: string | undefined
RichTextEditor.disabled?: boolean | undefined
RichTextEditor.minHeight?: number | undefined
RichTextEditor.className?: string | undefined
RichTextEditor.id?: string | undefined
RichTextEditor.onBlur?: (() => void) | undefined
RichTextEditor.aria-invalid?: boolean | 'true' | 'false' | undefined
RichTextEditor.aria-label?: string | undefined
RichTextEditor.aria-labelledby?: string | undefined
RichTextEditor.aria-describedby?: string | undefined
RichTextEditor.ai?: RichTextAiOptions | undefined
RichTextEditor.suggestion?: string | null | undefined
RichTextEditor.onReviewEnd?: ((result: RichTextReviewResult) => void) | undefined
type RichTextReviewResult = {}
RichTextReviewResult.accepted: number
RichTextReviewResult.rejected: number
```

## src/components/ui/rich-text-ai.tsx

```ts
const AI_CONTENT: '[&_.rte-ai-selection]:rounded-[2px] [&_.rte-ai-selection]:bg-primary-subtle [&_.rte-ai-selection]:text-foreground [&_.rte-ai-caret]:-mr-[2px] [&_.rte-ai-caret]:inline-block [&_.rte-ai-caret]:h-[1.2em] [&_.rte-ai-caret]:w-[2px] [&_.rte-ai-caret]:translate-y-[3px] [&_.rte-ai-caret]:rounded-full [&_.rte-ai-caret]:bg-primary'
const AiSelectionHighlight: Extension<any, any>
const AiSlashCommand: Extension<{ handlers: () => SlashHandlers | null; }, any>
function parseAnswer(answer: string) => Block[]
function parseInline(s: string, marks?: Mark[], href?: string) => Inline[]
function RichTextAi
RichTextAi.editor: Editor
RichTextAi.options: RichTextAiOptions
RichTextAi.open: boolean
RichTextAi.onOpenChange: (open: boolean) => void
RichTextAi.shortcut: string
RichTextAi.disabled?: boolean | undefined
RichTextAi.start?: RichTextAiCommand | null | undefined
type RichTextAiAction = 'improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'translate' | 'summarise' | 'continue' | 'custom'
type RichTextAiCommand = {}
RichTextAiCommand.action: RichTextAiAction
RichTextAiCommand.prompt?: string | undefined
RichTextAiCommand.language?: string | undefined
type RichTextAiOptions = {}
RichTextAiOptions.onRequest: (request: RichTextAiRequest) => AsyncIterable<string> | Promise<string>
RichTextAiOptions.actions?: ('improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'translate' | 'summarise')[] | undefined
RichTextAiOptions.languages?: string[] | undefined
RichTextAiOptions.defaultOpen?: boolean | RichTextAiCommand | undefined
RichTextAiOptions.slashCommand?: boolean | RichTextAiSlashAction[] | undefined
RichTextAiOptions.review?: boolean | undefined
type RichTextAiRequest = RichTextAiCommand & { text: string; scope: 'selection' | 'document'; signal: AbortSignal; }
type RichTextAiSlashAction = 'improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'summarise' | 'continue'
function RichTextAiSlashMenu
RichTextAiSlashMenu.editor: Editor
RichTextAiSlashMenu.options: RichTextAiOptions
RichTextAiSlashMenu.handlersRef: React.RefObject<SlashHandlers | null>
RichTextAiSlashMenu.onChoose: (command: RichTextAiCommand | null) => void
type SlashHandlers = {}
SlashHandlers.onKeyDown: (event: KeyboardEvent) => boolean
function toMarkdown(doc: ProseMirrorNode) => string
function toNodes(blocks: Block[]) => JSONContent[]
```

## src/components/ui/rich-text-review.tsx

```ts
const AiReview: Extension<any, any>
const REVIEW_CONTENT: string
function RichTextReview
RichTextReview.editor: Editor
RichTextReview.disabled?: boolean | undefined
RichTextReview.onEnd?: ((result: RichTextReviewResult) => void) | undefined
type RichTextReviewResult = {}
RichTextReviewResult.accepted: number
RichTextReviewResult.rejected: number
type RichTextSuggestion = {}
RichTextSuggestion.id: number
RichTextSuggestion.from: number
RichTextSuggestion.to: number
RichTextSuggestion.content: Fragment
RichTextSuggestion.block: boolean
RichTextSuggestion.original: string
function startReview(editor: Editor, after: ProseMirrorNode, { select }?: { select?: boolean | undefined; }) => number
function suggestChanges(before: ProseMirrorNode, after: ProseMirrorNode) => Change[]
```

## src/components/ui/rich-text-field.tsx

```ts
function RichTextField
RichTextField.label: React.ReactNode
RichTextField.description?: React.ReactNode
RichTextField.className?: string | undefined
RichTextField.labelAction?: React.ReactNode
RichTextField.hideLabel?: boolean | undefined
RichTextField.placeholder?: string | undefined
RichTextField.ai?: import("@/components/ui/rich-text-editor").RichTextAiOptions | undefined
RichTextField.disabled?: boolean | undefined
RichTextField.aria-label?: string | undefined
RichTextField.minHeight?: number | undefined
RichTextField.suggestion?: string | null | undefined
RichTextField.onReviewEnd?: ((result: import("@/components/ui/rich-text-editor").RichTextReviewResult) => void) | undefined
```
