# AI Runs and Traces

What agents did: `RunList`, a sortable table of runs (agent, status, trigger, start, duration, tokens, cost); and `RunTrace`, one run's steps — model calls, tool calls, retrieval — on a shared time axis, with the selected step's details.

**`RunList` takes** `runs` and `href(id)`. **`RunTrace` takes** `run` (status, duration, tokens, cost) and `spans` (id, parentId, kind, name, start and duration in ms, status, and optionally model, tokens, cost, input, output, error, and `agentId` on agent spans of a multi-agent run), plus optionally `defaultSelectedId`.

- Spans nest under their parent and are ordered as they ran; each is a button that says whether it is selected.
- The first failed step is selected on open, so the cause is in view.
- Details show input, output or the error, tokens and cost; changes are announced politely.
- Durations, tokens and costs follow the locale; costs keep fractions of a cent readable.
- Shapes map to OpenTelemetry spans and to what tools like Langfuse or the AI SDK's telemetry record.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-runs`.
