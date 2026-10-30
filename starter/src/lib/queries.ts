// Query keys and fetchers in one place. Route loaders prefetch with
// `queryClient.ensureQueryData(...)`; components read with `useSuspenseQuery(...)`.
import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { getOverview, getProject, listDeployments, listProjects, searchDeployments, type DeploymentQuery } from "@/lib/api"

export const overviewQuery = queryOptions({ queryKey: ["overview"], queryFn: getOverview })

export const projectsQuery = queryOptions({ queryKey: ["projects"], queryFn: listProjects })

export const projectQuery = (id: string) => queryOptions({ queryKey: ["projects", id], queryFn: () => getProject(id) })

export const deploymentsQuery = (id: string) => queryOptions({ queryKey: ["projects", id, "deployments"], queryFn: () => listDeployments(id) })

export const deploymentSearchQuery = (query: DeploymentQuery) =>
  queryOptions({
    queryKey: ["deployments", query],
    queryFn: () => searchDeployments(query),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  })
