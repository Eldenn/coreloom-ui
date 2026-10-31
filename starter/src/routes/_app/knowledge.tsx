// The documents agents search. Uploads are only recorded in memory; their status moves from queued
// to processing to indexed as the (simulated) indexing queue advances, and the query polls meanwhile.
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { KnowledgeBase, RetrievalTest } from '@/components/ai-knowledge'
import { PageHeader } from '@/components/app-shell'
import { reindexDocument, removeDocument, searchKnowledge, uploadDocuments } from '@/lib/ai-api'
import { useT } from '@/lib/locale'
import { documentsQuery } from '@/lib/queries'

export const Route = createFileRoute('/_app/knowledge')({
  staticData: { crumb: (t) => t.nav.knowledge },
  loader: ({ context }) => context.queryClient.ensureQueryData(documentsQuery),
  component: KnowledgePage,
})

function KnowledgePage() {
  const t = useT()
  const queryClient = useQueryClient()
  const { data: documents } = useSuspenseQuery(documentsQuery)
  const refresh = () => queryClient.invalidateQueries({ queryKey: documentsQuery.queryKey })
  return (
    <>
      <PageHeader title={t.ai.knowledge.title} description={t.ai.knowledge.description} />
      <KnowledgeBase
        documents={documents}
        onUpload={async (files) => {
          await uploadDocuments(files)
          await refresh()
        }}
        onReindex={async (id) => {
          await reindexDocument(id)
          await refresh()
        }}
        onRemove={async (id) => {
          await removeDocument(id)
          await refresh()
        }}
      />
      <RetrievalTest onSearch={searchKnowledge} />
    </>
  )
}
