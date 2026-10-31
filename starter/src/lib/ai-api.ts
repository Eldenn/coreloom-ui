// AI demo data, in memory, like src/lib/api.ts: agents, their runs and traces, the knowledge base
// and past conversations. Every function is async and waits a little; replace the bodies with
// fetch() calls to your backend (or your AI provider's dashboard API) and the pages stay the same.
// No model is called: the chat's answers are simulated by useDemoChat (src/hooks/use-demo-chat.ts, the @coreloom/demo-chat item).
import type { AgentSummary, AgentTool, AgentValues } from '@/components/ai-agents'
import type { Conversation } from '@/components/ai-chat'
import type { KnowledgeDocument, RetrievalResult } from '@/components/ai-knowledge'
import type { RunSummary, TraceSpan } from '@/components/ai-runs'
import type { AiMessage, AiModel } from '@/lib/ai'

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export const models: AiModel[] = [
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Balanced: strong at code and agents.',
    contextWindow: 200_000,
    pricing: { input: 3, output: 15 },
    capabilities: ['vision', 'tools', 'reasoning'],
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    provider: 'Anthropic',
    description: 'Quick answers at a low price.',
    contextWindow: 200_000,
    pricing: { input: 1, output: 5 },
    capabilities: ['vision', 'tools', 'fast'],
  },
  {
    id: 'gpt-mini',
    name: 'GPT mini',
    provider: 'OpenAI',
    description: 'Small and cheap, for classification.',
    contextWindow: 128_000,
    pricing: { input: 0.15, output: 0.6 },
    capabilities: ['tools', 'fast'],
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'Hosted in Europe.',
    contextWindow: 128_000,
    pricing: { input: 2, output: 6 },
    capabilities: ['tools'],
  },
]
const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? id

export const tools: AgentTool[] = [
  { id: 'searchDocs', name: 'searchDocs', description: 'Search the product documentation.' },
  {
    id: 'searchDeployments',
    name: 'searchDeployments',
    description: 'List deployments with their status and logs.',
  },
  {
    id: 'createTicket',
    name: 'createTicket',
    description: 'Open a ticket in the support queue.',
    sensitive: true,
  },
  {
    id: 'rollback',
    name: 'rollback',
    description: 'Roll a project back to an earlier deployment.',
    sensitive: true,
  },
]

export const knowledgeBases = [
  { id: 'kb_docs', name: 'Product docs' },
  { id: 'kb_runbooks', name: 'Runbooks' },
  { id: 'kb_changelog', name: 'Changelog' },
]

export type Agent = AgentValues & {
  id: string
  status: AgentSummary['status']
  lastRunAt?: string
  runsThisWeek: number
}

let agents: Agent[] = [
  {
    id: 'agt_support',
    name: 'Support triage',
    description: 'Reads new tickets, tags them and drafts a first answer from the docs.',
    instructions:
      'You triage support tickets for {{product}}.\n\n1. Tag the ticket.\n2. Search the docs.\n3. Draft a short, friendly first answer.',
    model: 'claude-sonnet',
    temperature: 0.4,
    maxSteps: 6,
    tools: ['searchDocs', 'createTicket'],
    askFirst: ['createTicket'],
    knowledge: ['kb_docs'],
    status: 'active',
    lastRunAt: minutesAgo(12),
    runsThisWeek: 1284,
  },
  {
    id: 'agt_deploy',
    name: 'Deploy doctor',
    description: 'Explains failed builds and proposes a fix or a rollback.',
    instructions:
      'You help {{team}} understand why a deployment of {{project}} failed.\n\n1. Look up the failed deployment and its logs.\n2. Explain the cause in two sentences.\n3. Propose a fix. Only offer a rollback when production is down.',
    model: 'claude-sonnet',
    temperature: 0.3,
    maxSteps: 8,
    tools: ['searchDocs', 'searchDeployments', 'rollback'],
    askFirst: ['rollback'],
    knowledge: ['kb_docs', 'kb_runbooks'],
    status: 'active',
    lastRunAt: minutesAgo(95),
    runsThisWeek: 86,
  },
  {
    id: 'agt_digest',
    name: 'Weekly digest',
    description: 'Summarises incidents, deploys and usage every Monday.',
    instructions:
      "Every Monday, summarise last week's incidents, deployments and usage for {{team}} in five bullet points.",
    model: 'claude-haiku',
    temperature: 0.5,
    maxSteps: 4,
    tools: ['searchDeployments'],
    askFirst: [],
    knowledge: ['kb_changelog'],
    status: 'paused',
    lastRunAt: minutesAgo(60 * 24 * 3),
    runsThisWeek: 0,
  },
]

const summary = (a: Agent): AgentSummary => ({
  id: a.id,
  name: a.name,
  description: a.description,
  status: a.status,
  model: modelName(a.model),
  toolCount: a.tools.length,
  lastRunAt: a.lastRunAt,
  runsThisWeek: a.runsThisWeek,
})

export async function listAgents(): Promise<AgentSummary[]> {
  await wait()
  return agents.map(summary)
}

export async function getAgent(id: string): Promise<Agent | null> {
  await wait()
  return agents.find((a) => a.id === id) ?? null
}

export async function createAgent(name: string): Promise<Agent> {
  await wait()
  const agent: Agent = {
    id: `agt_${Date.now().toString(36)}`,
    name,
    description: '',
    instructions: '',
    model: 'claude-sonnet',
    temperature: 0.7,
    maxSteps: 5,
    tools: [],
    askFirst: [],
    knowledge: [],
    status: 'draft',
    runsThisWeek: 0,
  }
  agents = [...agents, agent]
  return agent
}

export async function updateAgent(id: string, values: AgentValues): Promise<Agent> {
  await wait(600)
  agents = agents.map((a) => (a.id === id ? { ...a, ...values } : a))
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the agent was just updated in the list.
  return agents.find((a) => a.id === id)!
}

// Runs: generated once, in a fixed pattern, so the demo looks the same on every visit.
const STATUSES: RunSummary['status'][] = [
  'succeeded',
  'succeeded',
  'failed',
  'succeeded',
  'running',
  'succeeded',
  'cancelled',
  'succeeded',
]
const TRIGGERS = ['Chat', 'Schedule', 'API', 'Webhook']
const runs: (RunSummary & { agentId: string })[] = Array.from({ length: 36 }, (_, i) => {
  const agent = agents[i % agents.length]
  const status = STATUSES[i % STATUSES.length]
  return {
    id: `run_${(91_200 - i * 7).toString(36)}`,
    agentId: agent.id,
    agent: agent.name,
    status,
    trigger: TRIGGERS[i % TRIGGERS.length],
    startedAt: minutesAgo(i * 47 + 3),
    durationMs: status === 'running' ? undefined : 1800 + ((i * 2371) % 21_000),
    tokens: 900 + ((i * 1733) % 9000),
    cost: Math.round((0.002 + ((i * 37) % 90) / 1000) * 10_000) / 10_000,
  }
})

export async function listRuns(agentId?: string): Promise<RunSummary[]> {
  await wait()
  return agentId ? runs.filter((r) => r.agentId === agentId) : runs
}

export interface RunDetail {
  run: RunSummary
  spans: TraceSpan[]
}

/** One run's steps. A failed run fails on its last tool call; a running one is still on it. */
export async function getRun(id: string): Promise<RunDetail | null> {
  await wait()
  const run = runs.find((r) => r.id === id)
  if (!run) return null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- every demo run belongs to a demo agent.
  const agent = agents.find((a) => a.id === run.agentId)!
  const total = run.durationMs ?? 6000
  const at = (f: number) => Math.round(total * f)
  const last = run.status === 'failed' ? 'error' : run.status === 'running' ? 'running' : 'ok'
  const tool = agent.tools[0] ?? 'searchDocs'
  const spans: TraceSpan[] = [
    {
      id: 's1',
      kind: 'agent',
      name: agent.name,
      startMs: 0,
      durationMs: total,
      status: last === 'ok' ? 'ok' : last,
    },
    {
      id: 's2',
      parentId: 's1',
      kind: 'llm',
      name: 'plan',
      startMs: at(0.01),
      durationMs: at(0.18),
      status: 'ok',
      model: agent.model,
      tokens: { input: 1840, output: 212 },
      cost: 0.0087,
      output: 'Search first, then answer.',
    },
    {
      id: 's3',
      parentId: 's1',
      kind: 'tool',
      name: tool,
      startMs: at(0.2),
      durationMs: at(0.08),
      status: 'ok',
      input: { query: 'latest failed deployment' },
      output: { hits: 3 },
    },
    {
      id: 's4',
      parentId: 's1',
      kind: 'retrieval',
      name: knowledgeBases.find((k) => agent.knowledge.includes(k.id))?.name ?? 'docs',
      startMs: at(0.29),
      durationMs: at(0.05),
      status: 'ok',
      input: { query: 'type error' },
      output: [{ source: 'Type errors.md', score: 0.82 }],
    },
    {
      id: 's5',
      parentId: 's1',
      kind: 'llm',
      name: 'answer',
      startMs: at(0.35),
      durationMs: at(0.35),
      status: 'ok',
      model: agent.model,
      tokens: { input: 3520, output: 498 },
      cost: 0.0184,
    },
    {
      id: 's6',
      parentId: 's1',
      kind: 'tool',
      name: agent.tools.at(-1) ?? tool,
      startMs: at(0.72),
      durationMs: at(0.27),
      status: last,
      input: { project: 'coreloom-api' },
      ...(last === 'error'
        ? { error: 'The tool timed out after 10 s.' }
        : last === 'ok'
          ? { output: { ok: true } }
          : {}),
    },
  ]
  return { run, spans }
}

// Knowledge: a document's status follows the time since it was added, like a real indexing queue.
type StoredDocument = Omit<KnowledgeDocument, 'status' | 'progress' | 'chunks'> & {
  addedAt: number
  chunks: number
  fails?: boolean
  status?: KnowledgeDocument['status']
}

let documents: StoredDocument[] = [
  {
    id: 'd1',
    name: 'Deployments guide.md',
    size: 48_200,
    chunks: 64,
    status: 'indexed',
    updatedAt: minutesAgo(60 * 26),
    addedAt: 0,
  },
  {
    id: 'd2',
    name: 'Runbook — rollbacks.pdf',
    size: 1_284_000,
    chunks: 212,
    status: 'indexed',
    updatedAt: minutesAgo(60 * 50),
    addedAt: 0,
  },
  {
    id: 'd3',
    name: 'Changelog 2026.md',
    size: 96_400,
    chunks: 120,
    status: 'indexed',
    updatedAt: minutesAgo(60 * 5),
    addedAt: 0,
  },
  {
    id: 'd4',
    name: 'Scanned contract.pdf',
    size: 8_900_000,
    chunks: 0,
    status: 'failed',
    error: 'No text found: the PDF is a scan. Run OCR first.',
    updatedAt: minutesAgo(60 * 3),
    addedAt: 0,
  },
]

const QUEUE_MS = 1500
const INDEX_MS = 5000

function withStatus(d: StoredDocument): KnowledgeDocument {
  if (d.status)
    return { ...d, chunks: d.status === 'indexed' ? d.chunks : undefined, status: d.status }
  const elapsed = Date.now() - d.addedAt
  if (elapsed < QUEUE_MS) return { ...d, chunks: undefined, status: 'queued' }
  if (elapsed < QUEUE_MS + INDEX_MS)
    return {
      ...d,
      chunks: undefined,
      status: 'processing',
      progress: Math.round(((elapsed - QUEUE_MS) / INDEX_MS) * 100),
    }
  return { ...d, status: 'indexed' }
}

export async function listDocuments(): Promise<KnowledgeDocument[]> {
  await wait(150)
  return documents.map(withStatus)
}

export async function uploadDocuments(files: { name: string; size: number }[]): Promise<void> {
  await wait()
  const now = Date.now()
  documents = [
    ...documents,
    ...files.map((f, i) => ({
      id: `d${now}${i}`,
      name: f.name,
      size: f.size,
      chunks: Math.max(4, Math.round(f.size / 750)),
      updatedAt: new Date().toISOString(),
      addedAt: now,
    })),
  ]
}

export async function reindexDocument(id: string): Promise<void> {
  await wait()
  documents = documents.map((d) =>
    d.id === id
      ? {
          ...d,
          status: undefined,
          error: undefined,
          addedAt: Date.now(),
          chunks: d.chunks || 24,
          updatedAt: new Date().toISOString(),
        }
      : d,
  )
}

export async function removeDocument(id: string): Promise<void> {
  await wait()
  documents = documents.filter((d) => d.id !== id)
}

const passages = [
  {
    source: 'Runbook — rollbacks.pdf · p. 4',
    text: 'Roll back only to a deployment built from a branch that still exists; otherwise redeploy the last green commit.',
  },
  {
    source: 'Runbook — rollbacks.pdf · p. 2',
    text: 'Roll back when production is down and a fix will take longer than a few minutes. Tell the team in #incidents first.',
  },
  {
    source: 'Deployments guide.md',
    text: 'A failed type check stops the build before anything is uploaded. Fix the error and push again.',
  },
  {
    source: 'Deployments guide.md',
    text: 'Preview deployments are created for every branch and removed seven days after the branch is merged.',
  },
  {
    source: 'Changelog 2026.md',
    text: 'Workspace.slug is now Workspace.handle. The old name is removed in 0.8.',
  },
]

/** Scores each passage by the words it shares with the question: enough for a demo. */
export async function searchKnowledge(query: string): Promise<RetrievalResult[]> {
  await wait(450)
  const words = new Set(query.toLowerCase().match(/[a-zà-ÿ0-9]{3,}/g) ?? [])
  return passages
    .map((p, i) => {
      const own = p.text.toLowerCase().match(/[a-zà-ÿ0-9]{3,}/g) ?? []
      const hits = own.filter(
        (w) => words.has(w) || [...words].some((q) => w.startsWith(q.slice(0, 5))),
      ).length
      return { id: `p${i}`, ...p, score: Math.min(0.95, hits / Math.max(3, words.size) + 0.15) }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

// Conversations: titles and messages, per id.
let conversations: (Conversation & { updatedAt: string })[] = [
  { id: 'c1', title: 'Why did coreloom-api fail?', updatedAt: minutesAgo(25) },
  { id: 'c2', title: 'Release notes for v0.8', updatedAt: minutesAgo(60 * 5) },
  { id: 'c3', title: 'Build minutes by project', updatedAt: minutesAgo(60 * 26) },
  { id: 'c4', title: 'Onboarding checklist', updatedAt: minutesAgo(60 * 24 * 12) },
]
const threads = new Map<string, AiMessage[]>([
  [
    'c1',
    [
      {
        id: 'c1u1',
        role: 'user',
        parts: [{ type: 'text', text: 'Why did the last coreloom-api deployment fail?' }],
      },
      {
        id: 'c1a1',
        role: 'assistant',
        parts: [
          {
            type: 'reasoning',
            text: 'Find the failed deployment, then read its build log.',
            state: 'done',
          },
          {
            type: 'tool-searchDeployments',
            toolCallId: 't1',
            state: 'output-available',
            input: { project: 'coreloom-api', status: 'failed' },
            output: { id: 'dpl_8f2k', error: 'TS2339' },
          },
          {
            type: 'text',
            text: 'The build stopped on a **type error**: `Workspace.slug` was renamed to `handle` in 0.8.\n\nRename it in `src/routes/settings.tsx`, run `pnpm typecheck`, then push again.',
            state: 'done',
          },
          {
            type: 'source-url',
            sourceId: 's1',
            url: 'https://eldenn.github.io/coreloom-ui/',
            title: 'Deployments guide',
          },
        ],
      },
    ],
  ],
])

export async function listConversations(): Promise<Conversation[]> {
  await wait(150)
  return [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getMessages(id: string): Promise<AiMessage[]> {
  await wait(150)
  return threads.get(id) ?? []
}

// eslint-disable-next-line @typescript-eslint/require-await -- async like the real API it stands in for (no simulated delay here).
export async function saveConversation(
  id: string,
  title: string,
  messages: AiMessage[],
): Promise<void> {
  threads.set(id, messages)
  const updatedAt = new Date().toISOString()
  conversations = conversations.some((c) => c.id === id)
    ? conversations.map((c) => (c.id === id ? { ...c, updatedAt } : c))
    : [{ id, title, updatedAt }, ...conversations]
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await wait(150)
  conversations = conversations.map((c) => (c.id === id ? { ...c, title } : c))
}

export async function deleteConversation(id: string): Promise<void> {
  await wait(150)
  conversations = conversations.filter((c) => c.id !== id)
  threads.delete(id)
}
