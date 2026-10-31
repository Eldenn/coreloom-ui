// /runs and everything under it: adds the "Runs" breadcrumb.
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/runs')({
  staticData: { crumb: (t) => t.nav.runs },
  component: Outlet,
})
