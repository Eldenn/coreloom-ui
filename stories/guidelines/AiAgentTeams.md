# AI Agent Teams

A multi-agent system at a glance: `AgentTeams` puts the agent graph next to a panel on the selected agent — its role, team, model, status, who it reports to and delegates to, who it hands off to and takes over from, the tools and knowledge it uses — with links to its page and its runs. A team filter narrows the graph to one team and the tools it uses. `AgentDetails` is the panel on its own.

**`AgentTeams` takes** `agents` (as in the agent graph, plus a `description`), `edges` and `teams`, and optionally `href(id)` and `runsHref(id)`, `defaultSelectedId`, `defaultTeam` (`'all'`), `defaultView`, and `activity` / `activePath` to show a run.

**`agentActivityFromSpans(spans, agents)`** turns a run's trace spans (the `TraceSpan`s of ai-runs, or any spans with `id`, `parentId`, `kind`, `name`, `startMs`, `status`) into `{ activity, path }`: an agent span still running is _working_, or _waiting_ while an agent it started runs; finished spans are _done_ or _failed_. Spans are matched to agents by `agentId`, else by name.

- Names in the panel are buttons: they select that agent in the graph. Following one to an agent outside the filtered team shows every team again.
- The panel is a landmark ("Agent details"); the agent's name is its heading.
- Feed `activity` from your own events (the AI SDK's `data-*` parts, a websocket, polling) as the run progresses; the block only draws what it is given.
- Keep it to how agents relate. Each agent's settings belong in the agent editor (ai-agents), what a run did in its trace (ai-runs).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-teams`.
