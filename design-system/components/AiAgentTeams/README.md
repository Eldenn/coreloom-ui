# AI Agent Teams

A multi-agent system at a glance: `AgentTeams` puts the agent graph next to a panel on the selected agent — role, team, model, who it reports to, delegates to and hands off to, what it uses — with links to its page and its runs, and a team filter. `agentActivityFromSpans(spans, agents)` turns a run's trace spans into `activity` and `activePath`.

**`AgentTeams` takes** `agents` (as in AgentGraph, plus `description`), `edges`, `teams`, and optionally `href(id)`, `runsHref(id)`, `defaultSelectedId`, `defaultTeam`, `defaultView`, `activity`, `activePath` and `onEdit(selectedId)` (an Edit graph button for your agent builder; `agentTeamToWorkflow` and `workflowToAgentTeam` in ai-agent-builder convert both ways: delegation = LangGraph supervisor, handoff = swarm).

- Names in the panel select that agent (and scroll it into view), with the link's label; the panel is a landmark named "Agent details".
- A team's view keeps its members and the tools and knowledge they use.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-teams`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
