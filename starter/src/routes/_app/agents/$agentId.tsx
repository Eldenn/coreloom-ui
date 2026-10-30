// One agent: its settings (the AgentEditor form) and its latest runs.
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"

import { AgentStatusBadge, AgentEditor } from "@/components/ai-agents"
import { RunList } from "@/components/ai-runs"
import { PageHeader } from "@/components/app-shell"
import { Brand } from "@/components/brand"
import { NotFoundPage } from "@/components/error-page"
import { toast } from "@/components/ui/sonner"
import { knowledgeBases, models, tools, updateAgent } from "@/lib/ai-api"
import { useT } from "@/lib/locale"
import { agentQuery, agentsQuery, runsQuery } from "@/lib/queries"

export const Route = createFileRoute("/_app/agents/$agentId")({
  loader: async ({ context, params }) => {
    const [agent] = await Promise.all([
      context.queryClient.ensureQueryData(agentQuery(params.agentId)),
      context.queryClient.ensureQueryData(runsQuery(params.agentId)),
    ])
    if (!agent) throw notFound()
    return { crumb: agent.name }
  },
  notFoundComponent: AgentNotFound,
  component: AgentPage,
})

function AgentNotFound() {
  const t = useT()
  return <NotFoundPage brand={<Brand />} title={t.ai.agents.notFoundTitle} description={t.ai.agents.notFoundText} homeHref="/agents" className="min-h-[60vh]" />
}

function AgentPage() {
  const t = useT()
  const queryClient = useQueryClient()
  const { agentId } = Route.useParams()
  const { data: agent } = useSuspenseQuery(agentQuery(agentId))
  const { data: runs } = useSuspenseQuery(runsQuery(agentId))
  if (!agent) return <AgentNotFound />

  const { id: _id, status, lastRunAt: _last, runsThisWeek: _runs, ...values } = agent
  return (
    <>
      <PageHeader title={agent.name} description={<AgentStatusBadge status={status} />} />
      <div className="flex flex-col gap-8">
        <AgentEditor
          key={agent.id}
          className="max-w-3xl"
          defaultValues={values}
          models={models}
          tools={tools}
          knowledgeBases={knowledgeBases}
          onSubmit={async (next) => {
            const saved = await updateAgent(agent.id, next)
            queryClient.setQueryData(agentQuery(agent.id).queryKey, saved)
            await queryClient.invalidateQueries({ queryKey: agentsQuery.queryKey, exact: true })
            toast.success(t.ai.agents.saved)
          }}
        />
        <section aria-labelledby="agent-runs" className="flex min-w-0 flex-col gap-3">
          <h2 id="agent-runs" className="m-0 text-[15px] font-semibold text-foreground">
            {t.ai.agents.recentRuns}
          </h2>
          <RunList runs={runs.slice(0, 8)} href={(id) => `/runs/${id}`} />
        </section>
      </div>
    </>
  )
}
