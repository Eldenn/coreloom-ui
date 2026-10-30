// Compare models on one prompt. The answers are canned and streamed locally; with a backend,
// onRun would start one request per variant and stream each into `results`.
import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Playground, type PlaygroundResult, type PlaygroundVariant } from "@/components/ai-playground"
import { PageHeader } from "@/components/app-shell"
import { models } from "@/lib/ai-api"
import { useT } from "@/lib/locale"

export const Route = createFileRoute("/_app/playground")({
  staticData: { crumb: (t) => t.nav.playground },
  component: PlaygroundPage,
})

const SPEED: Record<string, number> = { "claude-haiku": 6, "gpt-mini": 5, "claude-sonnet": 3, "mistral-large": 3 }

function PlaygroundPage() {
  const t = useT()
  const [results, setResults] = React.useState<Record<string, PlaygroundResult>>({})
  const timers = React.useRef<ReturnType<typeof setInterval>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearInterval), [])

  const run = ({ variants }: { variants: PlaygroundVariant[] }) => {
    timers.current.forEach(clearInterval)
    for (const v of variants) {
      const answer = t.ai.script.answer(t.ai.playground.prompt)
      const full = v.temperature > 1 ? `${answer}\n\n_(${v.temperature.toFixed(1)})_` : answer
      const started = performance.now()
      let i = 0
      setResults((r) => ({ ...r, [v.id]: { status: "running", text: "" } }))
      const timer = setInterval(() => {
        i += SPEED[v.model] ?? 4
        const done = i >= full.length
        setResults((r) => ({
          ...r,
          [v.id]: done
            ? { status: "done", text: full, latencyMs: Math.round(performance.now() - started), tokens: Math.round(full.length / 3.6), cost: (full.length / 3.6) * (v.model === "claude-sonnet" || v.model === "mistral-large" ? 0.000015 : 0.000004) }
            : { status: "running", text: full.slice(0, i) },
        }))
        if (done) clearInterval(timer)
      }, 20)
      timers.current.push(timer)
    }
  }

  return (
    <>
      <PageHeader title={t.ai.playground.title} description={`${t.ai.playground.description} ${t.ai.demo}`} />
      <Playground
        models={models}
        defaultSystem={t.ai.playground.system}
        defaultPrompt={t.ai.playground.prompt}
        defaultVariants={[
          { id: "a", model: "claude-haiku", temperature: 0.2 },
          { id: "b", model: "claude-sonnet", temperature: 0.7 },
        ]}
        results={results}
        onRun={run}
      />
    </>
  )
}
