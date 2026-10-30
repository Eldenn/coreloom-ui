// /runs and everything under it: adds the "Runs" breadcrumb.
import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/runs")({
  staticData: { crumb: (t) => t.nav.runs },
  component: Outlet,
})
