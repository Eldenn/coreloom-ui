# @coreloom/ai-knowledge

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-knowledge.tsx

```ts
function KnowledgeBase
KnowledgeBase.documents: KnowledgeDocument[]
KnowledgeBase.onUpload?: ((files: File[]) => void) | undefined
KnowledgeBase.onReindex?: ((id: string) => void) | undefined
KnowledgeBase.onRemove?: ((id: string) => void) | undefined
KnowledgeBase.accept?: string | undefined
KnowledgeBase.className?: string | undefined
type KnowledgeDocument = {}
KnowledgeDocument.id: string
KnowledgeDocument.name: string
KnowledgeDocument.size: number
KnowledgeDocument.status: KnowledgeStatus
KnowledgeDocument.progress?: number | undefined
KnowledgeDocument.chunks?: number | undefined
KnowledgeDocument.updatedAt: string | Date
KnowledgeDocument.error?: string | undefined
type KnowledgeStatus = 'failed' | 'queued' | 'processing' | 'indexed'
type RetrievalResult = {}
RetrievalResult.id: string
RetrievalResult.text: string
RetrievalResult.source: string
RetrievalResult.score: number
function RetrievalTest
RetrievalTest.onSearch: (query: string) => Promise<RetrievalResult[]>
RetrievalTest.className?: string | undefined
```
