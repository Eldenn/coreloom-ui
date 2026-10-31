# AI Knowledge

The documents agents search: `KnowledgeBase`, totals and a table of files with their indexing status, re-index and remove; and `RetrievalTest`, ask a question and see the passages retrieval returns, with their scores.

**`KnowledgeBase` takes** `documents` (id, name, size, status `queued`, `processing`, `indexed` or `failed`, progress, chunks, updatedAt, error), plus optionally `onUpload(files)`, `onReindex(id)`, `onRemove(id)` and `accept`. **`RetrievalTest` takes** `onSearch(query)`, returning passages (text, source, score).

- Statuses are text badges; processing shows its progress; a failure says why and what to do.
- Removing a document asks first.
- Scores are written as percentages, not only drawn as bars; results are announced.
- Test retrieval with the questions users really ask before an agent relies on the knowledge.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-knowledge`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
