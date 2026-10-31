// Query keys and fetchers in one place. Route loaders prefetch with
// `queryClient.ensureQueryData(...)`; components read with `useSuspenseQuery(...)`.
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import {
  getAgent,
  getMessages,
  getRun,
  listAgents,
  listConversations,
  listDocuments,
  listRuns,
} from '@/lib/ai-api'
import {
  type DeploymentQuery,
  getOverview,
  getProject,
  getTeam,
  listDeployments,
  listNotifications,
  listProjects,
  searchDeployments,
} from '@/lib/api'

export const overviewQuery = queryOptions({ queryKey: ['overview'], queryFn: getOverview })

export const projectsQuery = queryOptions({ queryKey: ['projects'], queryFn: listProjects })

export const projectQuery = (id: string) =>
  queryOptions({ queryKey: ['projects', id], queryFn: () => getProject(id) })

export const deploymentsQuery = (id: string) =>
  queryOptions({ queryKey: ['projects', id, 'deployments'], queryFn: () => listDeployments(id) })

export const notificationsQuery = queryOptions({
  queryKey: ['notifications'],
  queryFn: listNotifications,
})

export const teamQuery = (me: { name: string; email: string }) =>
  queryOptions({ queryKey: ['team'], queryFn: () => getTeam(me) })

export const deploymentSearchQuery = (query: DeploymentQuery) =>
  queryOptions({
    queryKey: ['deployments', query],
    queryFn: () => searchDeployments(query),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  })

// AI pages (src/lib/ai-api.ts).
export const agentsQuery = queryOptions({ queryKey: ['agents'], queryFn: listAgents })

export const agentQuery = (id: string) =>
  queryOptions({ queryKey: ['agents', id], queryFn: () => getAgent(id) })

export const runsQuery = (agentId?: string) =>
  queryOptions({ queryKey: ['runs', { agentId }], queryFn: () => listRuns(agentId) })

export const runQuery = (id: string) =>
  queryOptions({ queryKey: ['runs', id], queryFn: () => getRun(id) })

export const documentsQuery = queryOptions({
  queryKey: ['knowledge'],
  queryFn: listDocuments,
  // Poll while something is being indexed.
  refetchInterval: (query) =>
    query.state.data?.some((d) => d.status === 'queued' || d.status === 'processing') ? 700 : false,
})

export const conversationsQuery = queryOptions({
  queryKey: ['conversations'],
  queryFn: listConversations,
})

export const messagesQuery = (id: string) =>
  queryOptions({
    queryKey: ['conversations', id],
    queryFn: () => getMessages(id),
    staleTime: Infinity,
  })
