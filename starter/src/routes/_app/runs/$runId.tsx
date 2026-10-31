// One run's trace: its steps on a time axis, the failed one selected first.
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { RunStatusBadge, RunTrace } from '@/components/ai-runs'
import { PageHeader } from '@/components/app-shell'
import { Brand } from '@/components/brand'
import { NotFoundPage } from '@/components/error-page'
import { useT } from '@/lib/locale'
import { runQuery } from '@/lib/queries'

export const Route = createFileRoute('/_app/runs/$runId')({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(runQuery(params.runId))
    if (!detail) throw notFound()
    return { crumb: detail.run.id }
  },
  notFoundComponent: RunNotFound,
  component: RunPage,
})

function RunNotFound() {
  const t = useT()
  return (
    <NotFoundPage
      brand={<Brand />}
      title={t.ai.runs.notFoundTitle}
      description={t.ai.runs.notFoundText}
      homeHref="/runs"
      className="min-h-[60vh]"
    />
  )
}

function RunPage() {
  const t = useT()
  const { runId } = Route.useParams()
  const { data } = useSuspenseQuery(runQuery(runId))
  if (!data) return <RunNotFound />
  const { run, spans } = data
  const tokens = spans.reduce(
    (sum, s) => ({
      input: sum.input + (s.tokens?.input ?? 0),
      output: sum.output + (s.tokens?.output ?? 0),
    }),
    { input: 0, output: 0 },
  )
  return (
    <>
      <PageHeader
        title={t.ai.runs.run(run.id)}
        description={
          <span className="inline-flex items-center gap-2">
            <RunStatusBadge status={run.status} />
            {run.agent} · {run.trigger}
          </span>
        }
      />
      <RunTrace
        run={{ status: run.status, durationMs: run.durationMs ?? 0, tokens, cost: run.cost }}
        spans={spans}
      />
    </>
  )
}
