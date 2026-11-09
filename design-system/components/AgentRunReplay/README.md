# Agent run replay

Replays a finished multi-agent run from its spans: the graph at each moment, play or scrub, the numbered turns, per-agent turns, time, tokens, tool calls, cost and errors.

**Install** `pnpm dlx shadcn@latest add @coreloom/ai-agent-replay`. Experimental.

**The consumer provides** `agents`, `edges`, `teams` (as for AgentTeams) and the run's `spans` (`TraceSpan` from ai-runs fits); optionally `defaultTime` and `avatars`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `AgentRunReplay`._
