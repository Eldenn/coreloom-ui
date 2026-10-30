// Demo data shared by the AI stories. Fixed dates, so screenshots stay the same.
import type { AgentSummary, AgentTool, AgentValues } from "@/components/ai-agents"
import type { KnowledgeDocument } from "@/components/ai-knowledge"
import type { RunSummary, TraceSpan } from "@/components/ai-runs"
import type { AiModel } from "@/lib/ai"

export const NOW = new Date("2026-10-14T10:00:00+02:00")
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

export const models: AiModel[] = [
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic" },
  { id: "claude-haiku", name: "Claude Haiku", provider: "Anthropic" },
  { id: "gpt-mini", name: "GPT mini", provider: "OpenAI" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral" },
]

export const agents: AgentSummary[] = [
  { id: "agt_support", name: "Support triage", description: "Reads new tickets, tags them and drafts a first answer from the docs.", status: "active", model: "Claude Sonnet", toolCount: 4, lastRunAt: ago(12), runsThisWeek: 1284 },
  { id: "agt_deploy", name: "Deploy doctor", description: "Explains failed builds and proposes a fix or a rollback.", status: "active", model: "Claude Sonnet", toolCount: 3, lastRunAt: ago(95), runsThisWeek: 86 },
  { id: "agt_digest", name: "Weekly digest", description: "Summarises incidents, deploys and usage every Monday.", status: "paused", model: "Claude Haiku", toolCount: 2, lastRunAt: ago(60 * 24 * 3), runsThisWeek: 0 },
  { id: "agt_sales", name: "Lead qualifier", description: "Scores inbound leads against the ideal customer profile.", status: "draft", model: "GPT mini", toolCount: 1 },
]

export const tools: AgentTool[] = [
  { id: "searchDocs", name: "searchDocs", description: "Search the product documentation." },
  { id: "searchDeployments", name: "searchDeployments", description: "List deployments with their status and logs." },
  { id: "createTicket", name: "createTicket", description: "Open a ticket in the support queue.", sensitive: true },
  { id: "rollback", name: "rollback", description: "Roll a project back to an earlier deployment.", sensitive: true },
]

export const knowledgeBases = [
  { id: "kb_docs", name: "Product docs" },
  { id: "kb_runbooks", name: "Runbooks" },
  { id: "kb_changelog", name: "Changelog" },
]

export const agentValues: AgentValues = {
  name: "Deploy doctor",
  description: "Explains failed builds and proposes a fix or a rollback.",
  instructions:
    "You help {{team}} understand why a deployment of {{project}} failed.\n\n1. Look up the failed deployment and its logs.\n2. Explain the cause in two sentences.\n3. Propose a fix. Only offer a rollback when production is down.",
  model: "claude-sonnet",
  temperature: 0.3,
  maxSteps: 8,
  tools: ["searchDocs", "searchDeployments", "rollback"],
  askFirst: ["rollback"],
  knowledge: ["kb_docs", "kb_runbooks"],
}

const STATUSES: RunSummary["status"][] = ["succeeded", "succeeded", "failed", "succeeded", "running", "succeeded", "cancelled", "succeeded"]
export const runs: RunSummary[] = Array.from({ length: 14 }, (_, i) => ({
  id: `run_${(9120 - i * 7).toString(36)}`,
  agent: agents[i % 3].name,
  status: STATUSES[i % STATUSES.length],
  trigger: ["Chat", "Schedule", "API", "Webhook"][i % 4],
  startedAt: ago(i * 47 + 3),
  durationMs: STATUSES[i % STATUSES.length] === "running" ? undefined : 1800 + ((i * 2371) % 21000),
  tokens: 900 + ((i * 1733) % 9000),
  cost: Math.round((0.002 + ((i * 37) % 90) / 1000) * 10000) / 10000,
}))

export const traceRun = { status: "failed" as const, durationMs: 9420, tokens: { input: 6120, output: 842 }, cost: 0.0312 }

export const spans: TraceSpan[] = [
  { id: "s1", kind: "agent", name: "Deploy doctor", startMs: 0, durationMs: 9420, status: "error" },
  { id: "s2", parentId: "s1", kind: "llm", name: "plan", startMs: 40, durationMs: 1830, status: "ok", model: "claude-sonnet", tokens: { input: 1840, output: 212 }, cost: 0.0087, input: { messages: 3 }, output: "Look up the failed deployment, then read its logs." },
  { id: "s3", parentId: "s1", kind: "tool", name: "searchDeployments", startMs: 1900, durationMs: 640, status: "ok", input: { project: "coreloom-api", status: "failed", limit: 1 }, output: { id: "dpl_8f2k", branch: "main", error: "TS2339" } },
  { id: "s4", parentId: "s1", kind: "retrieval", name: "runbooks", startMs: 2580, durationMs: 410, status: "ok", input: { query: "TS2339 property does not exist" }, output: [{ source: "Type errors.md", score: 0.82 }] },
  { id: "s5", parentId: "s1", kind: "llm", name: "explain", startMs: 3020, durationMs: 3610, status: "ok", model: "claude-sonnet", tokens: { input: 3520, output: 498 }, cost: 0.0184 },
  { id: "s6", parentId: "s1", kind: "tool", name: "rollback", startMs: 6700, durationMs: 2680, status: "error", input: { project: "coreloom-api", deployment: "dpl_5t3q" }, error: "Rollback refused: dpl_5t3q was built from a branch that no longer exists." },
  { id: "s7", parentId: "s6", kind: "llm", name: "summarise error", startMs: 8600, durationMs: 760, status: "ok", model: "claude-haiku", tokens: { input: 760, output: 132 }, cost: 0.0041 },
]

export const documents: KnowledgeDocument[] = [
  { id: "d1", name: "Deployments guide.md", size: 48_200, status: "indexed", chunks: 64, updatedAt: ago(60 * 26) },
  { id: "d2", name: "Runbook — rollbacks.pdf", size: 1_284_000, status: "indexed", chunks: 212, updatedAt: ago(60 * 50) },
  { id: "d3", name: "Pricing 2026.docx", size: 312_000, status: "processing", progress: 62, updatedAt: ago(2) },
  { id: "d4", name: "Incident 42 postmortem.md", size: 18_400, status: "queued", updatedAt: ago(1) },
  { id: "d5", name: "Scanned contract.pdf", size: 8_900_000, status: "failed", error: "No text found: the PDF is a scan. Run OCR first.", updatedAt: ago(60 * 3) },
]
