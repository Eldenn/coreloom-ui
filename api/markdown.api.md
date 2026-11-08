# @coreloom/markdown

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/markdown.tsx

```ts
function Markdown
Markdown.children: string
Markdown.streaming?: boolean | undefined
Markdown.sources?: readonly CitationSource[] | undefined
Markdown.codeBlocks?: Readonly<Partial<Record<string, React.ComponentType<MarkdownCodeBlockProps>>>> | undefined
Markdown.inline?: boolean | undefined
Markdown.className?: string | undefined
type MarkdownCodeBlockProps = {}
MarkdownCodeBlockProps.code: string
MarkdownCodeBlockProps.language: string
MarkdownCodeBlockProps.streaming: boolean
MarkdownCodeBlockProps.children: React.ReactNode
function MarkdownCodeBlocksContext
MarkdownCodeBlocksContext.*: react
type MarkdownCodeRenderers = { readonly [x: string]: React.ComponentType<MarkdownCodeBlockProps> | undefined; }
```
