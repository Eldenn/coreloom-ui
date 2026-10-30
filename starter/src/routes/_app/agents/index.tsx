import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { AgentList } from "@/components/ai-agents"
import { PageHeader } from "@/components/app-shell"
import { createAgent } from "@/lib/ai-api"
import { useT } from "@/lib/locale"
import { agentsQuery } from "@/lib/queries"

export const Route = createFileRoute("/_app/agents/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(agentsQuery),
  component: AgentsPage,
})

function AgentsPage() {
  const t = useT()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: agents } = useSuspenseQuery(agentsQuery)
  return (
    <>
      <PageHeader title={t.ai.agents.title} description={t.ai.agents.description} />
      <AgentList
        agents={agents}
        href={(id) => `/agents/${id}`}
        onNew={async () => {
          const agent = await createAgent(t.ai.agents.newName)
          await queryClient.invalidateQueries({ queryKey: agentsQuery.queryKey })
          void navigate({ to: "/agents/$agentId", params: { agentId: agent.id } })
        }}
      />
    </>
  )
}
