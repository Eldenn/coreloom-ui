// /agents and everything under it: adds the "Agents" breadcrumb.
import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/agents")({
  staticData: { crumb: (t) => t.nav.agents },
  component: Outlet,
})
