---
'@coreloom/ui': minor
---

### Added

- `AgentAvatar` (`@coreloom/agent-avatar`): a small animated face for an AI agent, `face` or
  `dots`, that is `idle` (blinks), `thinking` (looks around), `speaking` (talks), `done` (smiles),
  `error` or `offline`. A `seed` gives each agent a stable colour and eyes (`agentAvatarLook`);
  the state is said to screen readers and the motion stops for reduced motion.
- `Chat`, `ChatMessages` and `ChatMessage` take `assistantAvatar` to draw the assistant as an
  AgentAvatar that thinks while it waits and talks while it streams.
- `AgentPlan` takes `avatar`; `AgentGraph` and `AgentTeams` take `avatars` (`face` or `dots`),
  whose faces follow the run's `activity`. `agentAvatarState` maps an activity to a state.
- The theme's `theme.css` has the `agent-*` animations.

### Upgrading

- To use AgentAvatar in an app that installed `@coreloom/theme` before, add the theme again
  (`pnpm dlx shadcn@latest add @coreloom/theme`) for the new animations.
