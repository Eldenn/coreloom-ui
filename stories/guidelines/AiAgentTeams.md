# AI Agent Teams

A multi-agent system at a glance: `AgentTeams` puts the agent graph next to a panel on the selected agent — its role, team, model, status, who it reports to and delegates to, who it hands off to and takes over from, the tools and knowledge it uses — with links to its page and its runs. A team filter narrows the graph to one team and the tools it uses. `AgentDetails` is the panel on its own.

**`AgentTeams` takes** `agents` (as in the agent graph, plus a `description`), `edges` and `teams`, and optionally `href(id)` and `runsHref(id)`, `defaultSelectedId`, `defaultTeam` (`'all'`), `defaultView` (left out, a list on a box too narrow to read the graph), `activity` / `activePath` to show a run, and `onEdit(selectedId)`, which adds an **Edit graph** button for your agent builder.

**`agentActivityFromSpans(spans, agents)`** turns a run's trace spans (the `TraceSpan`s of ai-runs, or any spans with `id`, `parentId`, `kind`, `name`, `startMs`, `status`) into `{ activity, path }`: an agent span still running is _working_, or _waiting_ while an agent it started runs; finished spans are _done_ or _failed_. Spans are matched to agents by `agentId`, else by name.

**With the agent builder** (ai-agent-builder): `agentTeamToWorkflow({ agents, edges, teams })` turns a team into the builder's graph in LangGraph's two multi-agent patterns. A delegation is a _supervisor_: a Router after the supervisor has one route per worker, and each worker goes back to it when done (`langgraph-supervisor`). A handoff is a _swarm_ move: a route to the next agent, named by the link's label. An agent with no supervisor ends the run when done. Tools and knowledge go in each agent's `tools`; teams, roles and descriptions travel in the nodes' `data`. `workflowToAgentTeam(workflow, { tools })` reads a builder graph (or one from `fromLangGraphJSON`) back as a team: when two agents lead to each other and only one can end the run (else the one nearer START), it delegates to the other; any other move is a handoff.

- Names in the panel are buttons: they select that agent in the graph, and scroll it into view. A link's label follows the name ("Tech support · Bugs"). Following one to an agent outside the filtered team shows every team again.
- The panel is a landmark ("Agent details"); the agent's name is its heading.
- Feed `activity` from your own events (the AI SDK's `data-*` parts, a websocket, polling) as the run progresses; the block only draws what it is given.
- Keep it to how agents relate. Each agent's settings belong in the agent editor (ai-agents), what a run did in its trace (ai-runs).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-teams`.
