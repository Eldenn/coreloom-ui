# AgentAvatar

A small animated face for an AI agent, in the spirit of a bot's face or a chat's typing dots: it breathes, blinks and glances aside while it waits, looks up with a glowing halo while it thinks, talks with an uneven rhythm while it answers, opens its eyes wide while it listens, smiles with a spark when it is done, flashes and shakes on an error and dozes when offline. Each change of state plays a short bounce, and hovering it makes it squint, pleased. Each agent gets its own colour, eyes and rhythm from a seed (a team never blinks in step), so the members of a team are told apart at a glance in a chat, a plan or a graph.

**The consumer provides** the agent's `name` (said with its state to screen readers, "Researcher, thinking"; default "AI agent"), a `state` (`idle` by default, `thinking`, `speaking`, `listening`, `done`, `error`, `offline`) and a `seed` (the agent's id) for a stable look. Optionally `variant` (`face` by default, or `dots`: three dots that wave and bounce), `shape` (`square`, rounded, by default for the face; `circle`, by default for the dots; `hexagon`, `diamond`, `shield`, `blob`; or `seed` to let the seed pick one), `tone` (`primary` follows the accent; `neutral`, `teal`, `violet`, `orange`, `blue`, `pink`), `eyes` (`round`, `tall`, `square`, face only), `size` (`xs` 16 px, `sm` 24, `md` 32 by default, `lg` 40, `xl` 56), `animated` (default `true`; `false` shows the state without moving) and `decorative`. `agentAvatarLook(seed)` returns the tone, eyes, shape and phase a seed gets.

- Map the agent's real state, not a mood: `thinking` while it reasons or calls tools, `speaking` while text streams in, `listening` while it records the person's voice or waits on their answer, `done` when its work is finished, `error` when it failed. `error` turns red and `offline` grey, whatever the tone.
- It is an image named "name, state". Set `decorative` when the name and state are already written next to it (a list row, a chat message): it is then hidden from screen readers.
- The state is never in the motion or the colour alone: the face changes shape (closed eyes, a smile, crosses) and the state is in the name.
- Loops are small and slow, and stop for people who ask for reduced motion; the error flash and shake, the done pop and spark, and the bounce between states play once. Keep one or two busy avatars per view; in a long list pass `animated={false}` or use `variant="dots"`.
- The motions come from the `agent-*` animations in the theme's `theme.css`: an app that installed the theme before this item must add it again.
- Pick one shape for a product, or `shape="seed"` when a team should be told apart by outline as well as colour. The halo and the error flash follow the outline. A square or a circle reads best at `xs`; the diamond is the smallest inside, so keep it to `md` and up.
- Built in: `Chat` takes `assistantAvatar` (`{ seed, variant, shape }`), `AgentPlan` takes `avatar` (the same options), `AgentGraph` and `AgentTeams` take `avatars="face"` or `"dots"`.
- For a person, use Avatar with their photo or initials.


_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/agent-avatar` and import from `@/components/ui/agent-avatar`._
