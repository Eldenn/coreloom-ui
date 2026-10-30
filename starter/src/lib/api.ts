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
  // Events, not sentences: the UI words them in the reader's language (src/messages.ts → overview.events).
  activity: { id: string; event: "deployed" | "joined" | "buildFailed"; subject: string; detail?: string; at: string }[]
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
  return listDeploymentsNow(projectId)
}

function listDeploymentsNow(projectId: string): Deployment[] {
  const seed = projectId.length + projectId.charCodeAt(projectId.length - 1)
  return Array.from({ length: 6 }, (_, i) => ({
    id: `dpl_${projectId.slice(4)}${i}`,
    commit: ((seed * 7919 + i * 104729) % 0xfffffff).toString(16).padStart(7, "0"),
    branch: i % 3 === 0 ? "main" : `feature/${["auth", "billing", "search"][i % 3]}`,
    status: i === 1 && seed % 2 ? "failed" : "ready",
    createdAt: hoursAgo(i * 9 + 2 + (seed % 7)),
    duration: 28 + ((seed + i * 13) % 40),
  }))
}

export type DeploymentRow = Deployment & { projectId: string; project: string }

export type DeploymentQuery = {
  page: number
  pageSize: number
  /** "createdAt" | "duration" | "project", with desc. */
  sort?: { id: string; desc: boolean }
  search: string
}

/** Every deployment across projects, a page at a time — the server sorts, filters and slices. */
export async function searchDeployments(query: DeploymentQuery): Promise<{ rows: DeploymentRow[]; total: number }> {
  await wait()
  const rows: DeploymentRow[] = []
  for (const project of projects) {
    for (const d of listDeploymentsNow(project.id)) rows.push({ ...d, projectId: project.id, project: project.name })
  }
  const q = query.search.trim().toLowerCase()
  let matching = q ? rows.filter((r) => r.project.includes(q) || r.commit.includes(q) || r.branch.includes(q)) : rows
  const { id, desc } = query.sort ?? { id: "createdAt", desc: true }
  const key = (r: DeploymentRow) => (id === "duration" ? r.duration : id === "project" ? r.project : r.createdAt)
  matching = [...matching].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0) * (desc ? -1 : 1))
  const start = (query.page - 1) * query.pageSize
  return { rows: matching.slice(start, start + query.pageSize), total: matching.length }
}

// ——— Notifications ———

export type Notification = { id: string; event: "deployed" | "joined" | "buildFailed"; subject: string; detail?: string; at: string; read: boolean; href?: string }

let notifications: Notification[] = [
  { id: "nt1", event: "deployed", subject: "coreloom-web", detail: "main · 3f2a9c1", at: hoursAgo(0.05), read: false, href: "/deployments?q=coreloom-web" },
  { id: "nt2", event: "buildFailed", subject: "coreloom-api", detail: "src/billing.ts", at: hoursAgo(1.2), read: false, href: "/deployments?q=coreloom-api" },
  { id: "nt3", event: "joined", subject: "Ada", at: hoursAgo(5), read: false, href: "/settings?section=members" },
  { id: "nt4", event: "deployed", subject: "docs", at: hoursAgo(26), read: true },
]

export async function listNotifications(): Promise<Notification[]> {
  await wait(150)
  return notifications.map((n) => ({ ...n }))
}

export async function markNotificationsRead(ids: string[] | "all"): Promise<void> {
  await wait(150)
  notifications = notifications.map((n) => (ids === "all" || ids.includes(n.id) ? { ...n, read: true } : n))
}

// ——— Team ———

export type Member = { id: string; name: string; email: string; role: string }
export type Invite = { id: string; email: string; role: string; invitedAt: string }

let members: Member[] = [
  { id: "me", name: "You", email: "", role: "owner" },
  { id: "m2", name: "Ada Lovelace", email: "ada@acme.dev", role: "admin" },
  { id: "m3", name: "Grace Hopper", email: "grace@acme.dev", role: "developer" },
  { id: "m4", name: "Alan Turing", email: "alan@acme.dev", role: "viewer" },
]
let invites: Invite[] = [{ id: "iv1", email: "linus@acme.dev", role: "developer", invitedAt: hoursAgo(50) }]

export async function getTeam(me: { name: string; email: string }): Promise<{ members: Member[]; invites: Invite[] }> {
  await wait()
  members = members.map((m) => (m.id === "me" ? { ...m, ...me } : m))
  return { members: members.map((m) => ({ ...m })), invites: invites.map((i) => ({ ...i })) }
}

export async function inviteMembers(emails: string[], role: string): Promise<void> {
  await wait(500)
  const taken = emails.filter((e) => members.some((m) => m.email === e) || invites.some((i) => i.email === e))
  if (taken.length) throw new ApiError(`Already in the workspace: ${taken.join(", ")}`, "emails")
  invites = [...invites, ...emails.map((email, i) => ({ id: `iv${Date.now()}${i}`, email, role, invitedAt: new Date().toISOString() }))]
}

export async function setMemberRole(id: string, role: string): Promise<void> {
  await wait(300)
  members = members.map((m) => (m.id === id ? { ...m, role } : m))
}

export async function removeMember(id: string): Promise<void> {
  await wait(300)
  members = members.filter((m) => m.id !== id)
}

export async function revokeInvite(id: string): Promise<void> {
  await wait(300)
  invites = invites.filter((i) => i.id !== id)
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
      { id: "a1", event: "deployed", subject: "coreloom-web", detail: "main · 3f2a9c1", at: hoursAgo(0.05) },
      { id: "a2", event: "joined", subject: "Ada", at: hoursAgo(1) },
      { id: "a3", event: "buildFailed", subject: "coreloom-api", detail: "src/billing.ts", at: hoursAgo(1.2) },
      { id: "a4", event: "deployed", subject: "docs", at: hoursAgo(3) },
    ],
  }
}
