// Demo data, in memory. Every function is async and waits a little, like a real API would:
// replace their bodies with fetch() calls to your backend and the rest of the app stays the same.

export type ProjectStatus = "ready" | "building" | "failed"
export type Region = "cdg1" | "fra1" | "iad1"

export type Project = {
  id: string
  name: string
  status: ProjectStatus
  region: Region
  framework: string
  updatedAt: string
  description: string
}

export type Deployment = { id: string; commit: string; branch: string; status: ProjectStatus; createdAt: string; duration: number }

export type Overview = {
  stats: { deployments: number; successRate: number; medianBuild: number; incidents: number }
  daily: { day: string; production: number; preview: number }[]
  activity: { id: string; title: string; description?: string; at: string; status: "success" | "danger" | "neutral" }[]
}

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

const names = ["coreloom-web", "coreloom-api", "docs", "marketing-site", "billing-service", "auth-gateway", "status-page", "design-tokens", "cli", "mobile-bff", "analytics-worker", "image-proxy", "search-indexer", "mailer"]
const statuses: ProjectStatus[] = ["ready", "ready", "building", "ready", "failed"]
const regions: Region[] = ["cdg1", "fra1", "iad1"]
const frameworks = ["React + Vite", "AdonisJS", "Next.js", "Astro"]

let projects: Project[] = names.map((name, i) => ({
  id: `prj_${(i + 11).toString(36)}${name.length}`,
  name,
  status: statuses[i % statuses.length],
  region: regions[i % regions.length],
  framework: frameworks[(i * 3) % frameworks.length],
  updatedAt: hoursAgo(i * 5 + 1),
  description: "",
}))

export async function listProjects(): Promise<Project[]> {
  await wait()
  return [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getProject(id: string): Promise<Project | null> {
  await wait()
  return projects.find((p) => p.id === id) ?? null
}

export async function listDeployments(projectId: string): Promise<Deployment[]> {
  await wait()
  const seed = projectId.length
  return Array.from({ length: 6 }, (_, i) => ({
    id: `dpl_${projectId.slice(4)}${i}`,
    commit: ((seed * 7919 + i * 104729) % 0xfffffff).toString(16).padStart(7, "0"),
    branch: i % 3 === 0 ? "main" : `feature/${["auth", "billing", "search"][i % 3]}`,
    status: i === 1 && seed % 2 ? "failed" : "ready",
    createdAt: hoursAgo(i * 9 + 2),
    duration: 28 + ((seed + i * 13) % 40),
  }))
}

export class ApiError extends Error {
  constructor(message: string, readonly field?: string) {
    super(message)
  }
}

export async function createProject(input: { name: string; region: Region; framework: string }): Promise<Project> {
  await wait(600)
  if (projects.some((p) => p.name === input.name)) throw new ApiError("A project already uses this name.", "name")
  const project: Project = { id: `prj_${Date.now().toString(36)}`, status: "building", updatedAt: new Date().toISOString(), description: "", ...input }
  projects = [project, ...projects]
  return project
}

export async function updateProject(id: string, input: Partial<Pick<Project, "name" | "region" | "description">>): Promise<Project> {
  await wait(600)
  if (input.name && projects.some((p) => p.name === input.name && p.id !== id)) throw new ApiError("A project already uses this name.", "name")
  projects = projects.map((p) => (p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p))
  return projects.find((p) => p.id === id)!
}

export async function deleteProject(id: string): Promise<void> {
  await wait(500)
  projects = projects.filter((p) => p.id !== id)
}

export async function getOverview(): Promise<Overview> {
  await wait()
  const today = new Date()
  return {
    stats: { deployments: 1284, successRate: 0.987, medianBuild: 42, incidents: 2 },
    daily: Array.from({ length: 30 }, (_, i) => {
      const day = new Date(today)
      day.setDate(today.getDate() - 29 + i)
      const weekday = day.getDay() % 6 !== 0
      return { day: day.toISOString().slice(0, 10), production: 32 + ((i * 7) % 11) + (weekday ? 14 : 0), preview: 58 + ((i * 5) % 13) + (weekday ? 22 : 4) }
    }),
    activity: [
      { id: "a1", title: "coreloom-web deployed to production", description: "main · 3f2a9c1", at: hoursAgo(0.05), status: "success" },
      { id: "a2", title: "Ada joined the workspace", at: hoursAgo(1), status: "neutral" },
      { id: "a3", title: "coreloom-api build failed", description: "Type error in src/billing.ts", at: hoursAgo(1.2), status: "danger" },
      { id: "a4", title: "docs deployed to production", at: hoursAgo(3), status: "success" },
    ],
  }
}
