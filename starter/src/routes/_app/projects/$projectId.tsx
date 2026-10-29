import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { ArrowLeftIcon, ExternalLinkIcon, GitBranchIcon } from "lucide-react"

import { PageHeader } from "@/components/app-shell"
import { Brand } from "@/components/brand"
import { NotFoundPage } from "@/components/error-page"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatRelative } from "@/lib/format"
import { useCoreloomI18n } from "@/lib/i18n"
import { useT } from "@/lib/locale"
import { deploymentsQuery, projectQuery } from "@/lib/queries"

export const Route = createFileRoute("/_app/projects/$projectId")({
  loader: async ({ context, params }) => {
    const [project] = await Promise.all([
      context.queryClient.ensureQueryData(projectQuery(params.projectId)),
      context.queryClient.ensureQueryData(deploymentsQuery(params.projectId)),
    ])
    // An unknown id renders this route's notFoundComponent, inside the app shell.
    if (!project) throw notFound()
    return { crumb: project.name }
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectPage,
})

function ProjectNotFound() {
  const t = useT()
  return <NotFoundPage brand={<Brand />} title={t.project.notFoundTitle} description={t.project.notFoundText} homeHref="/projects" className="min-h-[60vh]" />
}

function ProjectPage() {
  const t = useT()
  const { locale } = useCoreloomI18n()
  const { projectId } = Route.useParams()
  const { data: project } = useSuspenseQuery(projectQuery(projectId))
  const { data: deployments } = useSuspenseQuery(deploymentsQuery(projectId))
  if (!project) return <ProjectNotFound />

  return (
    <>
      <PageHeader
        title={project.name}
        description={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={project.status} />
            {project.framework} · {t.regions[project.region]}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/projects">
                <ArrowLeftIcon />
                {t.project.back}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <a href={`https://${project.name}.coreloom.dev`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon />
                {t.project.visit}
              </a>
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>{t.project.deployments}</CardTitle>
          <CardDescription>{t.project.deploymentsHint}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">{t.project.commit}</TableHead>
                <TableHead>{t.project.branch}</TableHead>
                <TableHead>{t.projects.status}</TableHead>
                <TableHead className="text-right">{t.project.duration}</TableHead>
                <TableHead className="pr-5 text-right">{t.project.created}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="pl-5 font-mono text-[12px] text-foreground">{deployment.commit}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] [&_svg]:size-3.5">
                      <GitBranchIcon aria-hidden />
                      {deployment.branch}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={deployment.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px]">{deployment.duration}s</TableCell>
                  <TableCell className="pr-5 text-right font-mono text-[12px]">{formatRelative(deployment.createdAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
