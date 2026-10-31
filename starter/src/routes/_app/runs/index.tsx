import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { RunList } from '@/components/ai-runs'
import { PageHeader } from '@/components/app-shell'
import { useT } from '@/lib/locale'
import { runsQuery } from '@/lib/queries'

export const Route = createFileRoute('/_app/runs/')({
  loader: ({ context }) => context.queryClient.query({ ...runsQuery(), staleTime: 'static' }),
  component: RunsPage,
})

function RunsPage() {
  const t = useT()
  const { data: runs } = useSuspenseQuery(runsQuery())
  return (
    <>
      <PageHeader title={t.ai.runs.title} description={t.ai.runs.description} />
      <RunList runs={runs} href={(id) => `/runs/${id}`} />
    </>
  )
}
