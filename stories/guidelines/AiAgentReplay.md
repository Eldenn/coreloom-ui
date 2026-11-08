# AI Agent Run Replay

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Replays a finished multi-agent run from its trace: the agent graph lit as it was at each moment, a timeline to scrub or play, the turns in order (a numbered path) and what each agent did and cost.

**`AgentRunReplay` takes** `agents`, `edges` and `teams` (as for AgentTeams), the run's `spans` — `TraceSpan`s from ai-runs fit: `{ id, parentId?, kind, name, agentId?, startMs, durationMs, status, tokens?, cost? }` — and optionally `defaultTime` (ms from the start) and `avatars` (`face` or `dots`).

- At each moment, a span that has started but not ended is running: the graph shows who is working, who waits for an agent it started, who is done or failed (`spansAt` + `agentActivityFromSpans`), and highlights the path so far.
- **Play** runs the replay in real time, or 2× and 4×; the slider moves through it by 0.1 s (arrow keys) and reads the moment and who is working. Play at the end starts over.
- **Turns** lists each time the work moved to another agent, numbered (`replaySteps`); a turn jumps there and selects that agent.
- The table gives each agent's turns, time, tokens, tool calls, cost and errors, counting what ran inside its turns (`agentRunMetrics`).
- For a run still going, show AgentTeams with `activity` from `agentActivityFromSpans`; for one run's full trace, RunTrace (ai-runs).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agent-replay`.
