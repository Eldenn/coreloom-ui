// /projects and everything under it: adds the "Projects" breadcrumb.
import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/projects")({
  staticData: { crumb: (t) => t.nav.projects },
  component: Outlet,
})
