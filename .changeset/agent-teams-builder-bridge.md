---
'@coreloom/ui': minor
---

### Added

- `agentTeamToWorkflow(team)` and `workflowToAgentTeam(workflow, { tools })` (ai-agent-builder):
  convert between the agent teams block and the agent builder's graph, in LangGraph's multi-agent
  patterns. A delegation is a supervisor (a Router to each worker, who comes back when done); a
  handoff is a swarm move (a route to the next agent, named by the link's label). Teams, roles,
  descriptions, tools and knowledge survive the trip, including through LangGraph JSON.
- `AgentTeams`: `onEdit(selectedId)` adds an **Edit graph** button to open your agent builder.
- `AgentTeams`: the panel shows each link's label next to the agent's name ("Tech support · Bugs").

### Changed

- `AgentGraph`: an agent selected out of sight (from the panel's links, say) scrolls into view.
- `AgentGraph`: without `defaultView`, a box too narrow to read the graph (a phone) starts on the
  list view.

### Upgrading

- `AgentTeams` reads a new string (`ai.agentTeams.edit`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- `ai-agent-builder` now depends on `@coreloom/agent-graph` (types only).
