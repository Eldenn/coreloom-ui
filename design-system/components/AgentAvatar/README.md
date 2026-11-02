# AgentAvatar

A small animated face for an AI agent, in the spirit of a bot's face or a chat's typing dots: it blinks while it waits, looks around while it thinks, talks while it answers, smiles when it is done and frowns on an error. Each agent gets its own colour and eyes from a seed, so the members of a team are told apart at a glance in a chat, a plan or a graph.

**The consumer provides** the agent's `name` (said with its state to screen readers, "Researcher, thinking"; default "AI agent"), a `state` (`idle` by default, `thinking`, `speaking`, `done`, `error`, `offline`) and a `seed` (the agent's id) for a stable look. Optionally `variant` (`face` by default, or `dots`: three dots that wave and bounce), `tone` (`primary` follows the accent; `neutral`, `teal`, `violet`, `orange`, `blue`, `pink`), `eyes` (`round`, `tall`, `square`, face only), `size` (`xs` 16 px, `sm` 24, `md` 32 by default, `lg` 40, `xl` 56) and `decorative`. `agentAvatarLook(seed)` returns the tone and eyes a seed gets.

- Map the agent's real state, not a mood: `thinking` while it reasons or calls tools, `speaking` while text streams in, `done` when its work is finished, `error` when it failed. `error` turns red and `offline` grey, whatever the tone.
- It is an image named "name, state". Set `decorative` when the name and state are already written next to it (a list row, a chat message): it is then hidden from screen readers.
- The state is never in the motion or the colour alone: the face changes shape (closed eyes, a smile, crosses) and the state is in the name.
- Loops are small and slow, and stop for people who ask for reduced motion; the error shake and the done pop play once. Keep one or two animated avatars per view; a long list reads better `idle` or with `variant="dots"`.
- The motions come from the `agent-*` animations in the theme's `theme.css`: an app that installed the theme before this item must add it again.
- Built in: `Chat` takes `assistantAvatar` (`{ seed, variant }`), `AgentPlan` takes `avatar`, `AgentGraph` and `AgentTeams` take `avatars="face"` or `"dots"`.
- For a person, use Avatar with their photo or initials.


_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/agent-avatar` and import from `@/components/ui/agent-avatar`._
