# @coreloom/inline-citation

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/inline-citation.tsx

```ts
type CitationSource = AiSourceUrlPart | AiSourceDocumentPart
function InlineCitation
InlineCitation.index: number
InlineCitation.source: CitationSource
InlineCitation.className?: string | undefined
function safeSourceUrl(url: string | undefined) => string | undefined
function sourceTitle(source: CitationSource) => string
function splitCitations(text: string, count: number, before?: string) => (string | number)[]
```
