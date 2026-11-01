---
'@coreloom/ui': minor
---

### Added

- `AgentGraph` (`@coreloom/agent-graph`): a multi-agent system as a graph. Agents are cards, teams
  are frames, and links show who delegates to whom (solid), who hands off to whom (dashed) and which
  tools and knowledge each agent uses (dotted). Laid out in layers without a graph library. One tab
  stop with arrow-key navigation, a List view that says the same in sentences, zoom and pan, and a
  run shown live with `activity` and `activePath`.
- `AgentTeams` (`@coreloom/ai-agent-teams`): the agent graph with a team filter and a panel on the
  selected agent (role, model, who it reports to, delegates and hands off to, what it uses) and
  links to its page and runs. `agentActivityFromSpans(spans, agents)` derives the live state from a
  run's trace spans.
- `TraceSpan` (ai-runs): optional `agentId` on agent spans, so a multi-agent run's trace can drive
  `AgentTeams`.

### Upgrading

- Both items read new strings (`ai.agentGraph`, `ai.agentTeams`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
