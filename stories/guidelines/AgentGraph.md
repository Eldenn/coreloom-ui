# Agent Graph

How a multi-agent system fits together: agents as cards, teams as frames around their members, and three kinds of links — **delegates** (solid: a supervisor gives a sub-task and gets the result back), **hands off** (dashed: the conversation moves to another agent) and **uses** (dotted: a tool or a knowledge base). Supervisors sit above the agents they delegate to; tools and knowledge share the bottom row. It is laid out by the component, with no graph library: there is nothing to drag or arrange.

**The consumer provides** `agents` (id, name, and optionally `kind` — `agent` by default, `human`, `tool` or `knowledge` —, `role`, `team`, `model`, `status`), `edges` (`from`, `to`, `kind`: `delegates`, `handoff` or `uses`, and an optional short `label`) and optionally `teams` (id, name). Selection is `selectedId` + `onSelectedChange`, or `defaultSelectedId`. To show a run: `activity` (by agent id: `working`, `waiting`, `done` or `failed`) and `activePath` (the agents in the order they took turns; the links between them are highlighted). Also `view` / `defaultView` (`graph` or `list`), `maxHeight` (560), `legend` (true) and `label`.

- One tab stop for the whole graph; arrow keys move to the agent beside, above or below, Home and End to the first and last. Enter or Space selects, Escape clears the selection.
- Each agent's button says its role, model, team, status and activity, and describes its links in sentences ("Reports to Triage. Hands off to On-call engineer."). The **List** view shows the same sentences, grouped by team — the better view on a phone and for anyone who doesn't read diagrams.
- Selecting an agent brings its links forward and fades the rest. Status and activity are always written, never colour alone; a paused or draft agent has a dashed border.
- While a run is shown, one polite live region says who is working.
- The graph fits its width (never above 100 %); the zoom buttons step from 50 % to 150 %, Ctrl or ⌘ + wheel zooms, dragging the background pans. On a phone it opens on the selected agent.
- Links that point at unknown agents, links to self and repeated ids are ignored; a delegation cycle is cut where it closes.
- Don't use it for a workflow with branches and conditions (that's a flow chart), or for more than a few dozen agents — at that size, a table with filters reads better.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/agent-graph`.
