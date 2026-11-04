---
'@coreloom/ui': minor
---

### Added

- `AgentAvatar` has a `listening` state (wide eyes, sound waves) and an `animated` prop
  (`false` shows the state without moving, for long lists).
- `AgentAvatar` has a `shape` prop: `square` (rounded, the face's default), `circle` (the dots'
  default), `hexagon`, `diamond`, `shield` or `blob`, or `seed` to let the seed pick one. The halo
  and the error flash follow the outline. `Chat`'s `assistantAvatar` and `AgentPlan`'s `avatar`
  take it too.
- `agentAvatarLook(seed)` also returns `phase`, where the agent's idle loops start, and `shape`.

### Changed

- `AgentAvatar` is livelier: at rest it breathes, blinks and glances aside, each agent on its
  own beat so a team never blinks in step; thinking and speaking glow with a halo; speech has an
  uneven rhythm; done adds cheeks and a spark, error a red flash, offline a floating "z"; every
  change of state plays a short bounce, and hovering it makes it squint. The dots breathe at rest
  and pulse while listening. Everything still stops for reduced motion.

### Upgrading

- The new motions are `agent-*` animations in the theme's `theme.css`: add `@coreloom/theme`
  again (`pnpm dlx shadcn@latest add @coreloom/theme`).
