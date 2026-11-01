# Agent Graph

How a multi-agent system fits together: agents as cards, teams as frames, and links for **delegates** (solid), **hands off** (dashed) and **uses** a tool or knowledge base (dotted). Supervisors sit above the agents they delegate to; tools and knowledge share the bottom row. Laid out by the component, no graph library.

**`AgentGraph` takes** `agents` (id, name, and optionally kind — agent, human, tool, knowledge —, role, team, model, status), `edges` (from, to, kind, label) and `teams`, plus optionally `selectedId` / `onSelectedChange` / `defaultSelectedId`, `activity` and `activePath` for a live run, `view` / `defaultView`, `maxHeight`, `legend` and `label`.

- One tab stop; arrow keys move between agents, Enter selects, Escape clears.
- Each agent's button says its role, model, team, status and activity and describes its links in sentences; the List view shows the same, by team.
- Zoom from 50 % to 150 %, fit to width, drag to pan.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/agent-graph`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
