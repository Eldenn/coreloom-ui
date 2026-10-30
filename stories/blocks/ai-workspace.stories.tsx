import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { AgentEditor, AgentList } from "@/components/ai-agents"
import { KnowledgeBase, RetrievalTest } from "@/components/ai-knowledge"
import { Playground, type PlaygroundResult } from "@/components/ai-playground"
import { RunList, RunTrace } from "@/components/ai-runs"
import { NOW, agentValues, agents, documents, knowledgeBases, models, runs, spans, tools, traceRun } from "./ai-data"

const meta = {
  title: "Blocks/AI/Workspace",
  component: AgentList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Managing AI agents: the list of agents, an agent's settings, its runs and their traces, a playground to compare models, and the knowledge base they search. Every block takes plain data; the starter wires them to TanStack Query.",
      },
    },
  },
  args: { agents: [], href: () => "#" },
} satisfies Meta<typeof AgentList>
export default meta
type Story = StoryObj<typeof meta>

export const Agents: Story = {
  render: () => <AgentList agents={agents} href={(id) => `#${id}`} onNew={() => {}} now={NOW} />,
}

/** Try it: clear the name to see the check, turn a tool on (sensitive ones ask first), type a {{variable}}. */
export const AgentSettings: Story = {
  render: () => (
    <div className="max-w-3xl">
      <AgentEditor defaultValues={agentValues} models={models} tools={tools} knowledgeBases={knowledgeBases} onSubmit={() => new Promise((r) => setTimeout(r, 700))} />
    </div>
  ),
}

export const Runs: Story = {
  render: () => <RunList runs={runs} href={(id) => `#${id}`} />,
}

/** Steps on a shared time axis; the failed tool call is selected first. */
export const Trace: Story = {
  render: () => <RunTrace run={traceRun} spans={spans} />,
}

const outputs: Record<string, string> = {
  a: "Your build failed on a **type error**: `Workspace.slug` was renamed to `handle`. Update `settings.tsx` and push again.",
  b: "The deployment failed during type checking because the `slug` property no longer exists on `Workspace`; it is now called `handle`. Rename it in `src/routes/settings.tsx`, run `pnpm typecheck` locally, then redeploy.",
}

/** Try it: Run all streams a canned answer into each variant. */
export const PlaygroundStory: Story = {
  name: "Playground",
  render: () => {
    const [results, setResults] = React.useState<Record<string, PlaygroundResult>>({
      a: { status: "done", text: outputs.a, latencyMs: 1240, tokens: 412, cost: 0.0021 },
      b: { status: "done", text: outputs.b, latencyMs: 3180, tokens: 655, cost: 0.0089 },
    })
    return (
      <Playground
        models={models}
        defaultSystem="You explain failed deployments to developers in two sentences."
        defaultPrompt="Why did deployment dpl_8f2k fail?"
        defaultVariants={[
          { id: "a", model: "claude-haiku", temperature: 0.2 },
          { id: "b", model: "claude-sonnet", temperature: 0.7 },
        ]}
        results={results}
        onRun={({ variants }) => {
          for (const v of variants) {
            const full = outputs[v.id] ?? outputs.a
            let i = 0
            const tick = setInterval(() => {
              i += 4
              const done = i >= full.length
              setResults((r) => ({ ...r, [v.id]: done ? { status: "done", text: full, latencyMs: 900 + full.length * 9, tokens: full.length * 2, cost: 0.003 } : { status: "running", text: full.slice(0, i) } }))
              if (done) clearInterval(tick)
            }, 25)
          }
        }}
      />
    )
  },
}

export const Knowledge: Story = {
  render: () => {
    const [docs, setDocs] = React.useState(documents)
    return (
      <div className="flex flex-col gap-4">
        <KnowledgeBase
          documents={docs}
          onUpload={(files) => setDocs((d) => [...d, ...files.map((f, i) => ({ id: `n${i}${f.name}`, name: f.name, size: f.size, status: "queued" as const, updatedAt: NOW }))])}
          onReindex={(id) => setDocs((d) => d.map((x) => (x.id === id ? { ...x, status: "queued" as const } : x)))}
          onRemove={(id) => setDocs((d) => d.filter((x) => x.id !== id))}
        />
        <RetrievalTest
          onSearch={async () => {
            await new Promise((r) => setTimeout(r, 400))
            return [
              { id: "r1", source: "Runbook — rollbacks.pdf · p. 4", score: 0.86, text: "Roll back only to a deployment built from a branch that still exists; otherwise redeploy the last green commit." },
              { id: "r2", source: "Deployments guide.md", score: 0.71, text: "A failed type check stops the build before anything is uploaded. Fix the error and push again." },
            ]
          }}
        />
      </div>
    )
  },
}
