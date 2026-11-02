# Changelog

What changed in the `@coreloom` registry, release by release. Versions follow
[Semantic Versioning](https://semver.org): while the major is 0, a minor can change a
component's API; each entry says what to do under **Upgrading**.

Installed components are your code: `shadcn add` won't touch them unless you pass
`--overwrite`. Read the release before overwriting, and diff with `git` afterwards.

The `@coreloom` namespace (`https://eldenn.github.io/coreloom-ui/r/{name}.json`) serves the
latest `main`. Every release is also tagged `vX.Y.Z` and published on GitHub Releases with its
registry attached, so a project can pin one by pointing the namespace there in
`components.json` (dependencies between items resolve through the same namespace):

```json
"registries": { "@coreloom": "https://github.com/Eldenn/coreloom-ui/releases/download/v0.10.0/{name}.json" }
```

## [0.10.0] - 2026-11-02

### Added

- `AgentBuilder` (`@coreloom/ai-agent-builder`): the agent side of the node editor.
  - **Reads / Writes**: each node names the state fields it uses and updates.
  - **Structured output**: an Agent can answer in a JSON Schema (checked as JSON).
  - **Tool parameters**: `AgentBuilderTool` takes `parameters` (a JSON Schema object) and
    `sensitive`; each parameter can be fixed per node (a value, an `{{ }}` expression, an `enum`
    value) or left to the model (`toolArgs`).
  - **Ask before running** (`askFirst`): tool calls a person approves first; sensitive tools are
    added when picked.
  - **Limits**: an Agent's max steps, max tokens per answer and timeout; the graph's recursion limit
    under State (`config` / `defaultConfig` / `onConfigChange`).
  - **Pauses**: any Agent, Tools, Function or Subgraph node can pause the run before or after it.
    `toLangGraphConfig(workflow, config)` gives `interrupt_before`, `interrupt_after` and
    `recursion_limit`; `onSave` and `onRun` now also get it as `config`.
  - **Review**: pass `interrupt` when your run pauses and a dialog lets a person approve, edit or
    reject each tool call, or answer a question; `onResume({ nodeId, decisions })` gets the
    decisions in LangChain's human-in-the-loop shape. A Human review node picks which decisions it
    offers.
- `toLangGraphJSON(workflow, state, config)` keeps the config in START's metadata;
  `fromLangGraphJSON` returns it as `config`.
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
- `AgentPlan` (`@coreloom/agent-plan`): the steps an agent works through, ticked off live (to do,
  in progress, done, failed, skipped) with "2 of 5 done" and a bar. It reads the `data-plan` part
  your stream writes and rewrites with the same `id`. `active` stops the spinner when the agent
  stops; `announce` reads the step in progress out on its own.
- `ToolForm` and `formTool()` (`@coreloom/tool-form`): a tool that asks the person with a form
  (text, email, web address, number, date, choice, checkbox) before it goes on. The answer becomes
  the tool's output; Cancel answers with an error the model reads. The fields can be the app's, or
  written by the model as the tool's input (read defensively with `readToolFormFields`).
- `Chat`, `ChatWidget`, `ChatMessages`, `ChatMessage`: `data-plan` parts show as an `AgentPlan`;
  `renderData(part)` draws your own `data-*` parts; `onToolOutput` takes `addToolOutput` as it is.
- `ToolCall`: `onOutput`, and `awaitsInput` on a `tool` entry. While such a call waits, `render`
  gets `submit(output)` and `cancel(reason?)`, the card says "Waiting for you" and the call isn't
  marked busy.
- `@coreloom/ai`: `AiDataPart`, `AiPlan`, `AiPlanStep`, `isDataPart`, `readPlan` (maps other
  agents' statuses such as `in_progress` and `completed`) and `planProgress`.
- `agentTeamToWorkflow(team)` and `workflowToAgentTeam(workflow, { tools })` (ai-agent-builder):
  convert between the agent teams block and the agent builder's graph, in LangGraph's multi-agent
  patterns. A delegation is a supervisor (a Router to each worker, who comes back when done); a
  handoff is a swarm move (a route to the next agent, named by the link's label). Teams, roles,
  descriptions, tools and knowledge survive the trip, including through LangGraph JSON.
- `AgentTeams`: `onEdit(selectedId)` adds an **Edit graph** button to open your agent builder.
- `AgentTeams`: the panel shows each link's label next to the agent's name ("Tech support · Bugs").
- `ai-artifact`: a document or a piece of code a model wrote, opened in a panel beside the chat.
  `ArtifactPanel` shows its versions (‹ v2 ›, labels and times), Preview and Source for Markdown,
  **Changes** against the previous version (a line diff with both line numbers and folded unchanged
  lines), Copy, Download (a file built in the browser) and **Restore this version**.
  `ArtifactCard` is the chip a message shows to open it, drawn with the Chat's `tools`;
  `ArtifactLayout` puts the chat and the panel side by side, resizable, and lays the panel over the
  chat when the space is narrow, keeping the chat mounted. `diffLines` and `artifactFilename` are
  exported for apps that need the same diff or file names.
- `@coreloom/rules`: installs `AGENTS.md` at the app's root with the Coreloom design,
  accessibility and text rules, so coding agents follow them on every change.
- Usage examples for assistants: every Storybook story file is published as a `registry:example`
  item (`button-demo`, `overlays-demo`, `ai-chat-demo`…, 42 in all, covering every component). shadcn's
  MCP server returns their code when an assistant asks for an example.
- README: reading Coreloom from a remote MCP server (GitMCP, GitHub's MCP server) when there is no
  local project, for example in claude.ai.
- `Heatmap` and `CalendarHeatmap` (`@coreloom/heatmap`): values on a grid of squares in five steps
  of one chart color, with a Less → More legend. `Heatmap` takes `{ row, column, value }` cells
  (weekday × hour, service × day); `CalendarHeatmap` lays `{ date, value }` days out in Monday-first
  weeks. One tab stop with arrow keys; every cell is named with its row, column or full date, and
  value.
- `FunnelChart` (`@coreloom/funnel-chart`): the steps of a flow as an ordered list, each with a
  bar against the first step, its count and share of the start, and between steps the share that
  continued.
- `TrendChart` (dashboard): `stacked` (`true`, or `'percent'` for 100 %), a per-series `type` to mix
  bars, lines and areas (combo charts), and `axis: 'right'` with `formatSecondaryValue` for a
  second axis. The tooltip now shows each series' name next to its formatted value.
- `RadarChart` (`@coreloom/radar-chart`): up to three series compared on the same measures, one
  axis each around a circle.
- `ScatterChart` (`@coreloom/scatter-chart`): two measures across many items, up to three groups,
  with an optional `size` measure for a bubble chart and named points in the tooltip.
- `TreemapChart` (`@coreloom/treemap-chart`): many parts of a whole as tiles sized by value,
  colored by up to five groups, with names and values in tiles that have room for them.
- `SankeyChart` (`@coreloom/sankey-chart`): flows between nodes in columns, as wide as the flow,
  colored by the column they leave. Unknown ids, loops and non-positive values are left out.
- All four sit on Recharts through `ChartContainer`, and give screen readers their data as text:
  a table (radar, scatter) or a list with values and shares (treemap, sankey).
- `Sparkline` (`@coreloom/sparkline`): a word-sized trend (line, area or bars) in plain SVG for stat
  cards, table cells and list rows. Screen readers hear your label plus the first and last value,
  the low and the high.
- `DonutChart` (`@coreloom/donut-chart`): parts of a whole as a ring with the total in the middle
  and a legend that states each value and share. Parts past `maxSlices` (3 by default, 5 at most)
  fold into a grey "Other".
- `BarList` (`@coreloom/bar-list`): a ranking as an HTML list, with a proportional bar per row,
  optional links through the app's router and a "Show all" button past `limit`.
- `Gauge` (`@coreloom/gauge`): one value against its range as an open ring, exposed as a `meter`,
  with optional `warning` / `critical` zones (stated in words) and `higherIsBetter` for uptime or
  scores.
- `StatCard` (app-shell, dashboard): `sparkline` prop, recent values drawn as a small area chart
  under the value.
- `RichTextEditor`: **Review changes** in the AI panel. A rewrite of existing text (improve, fix,
  shorten, lengthen, or an instruction) shows as changes in the text itself, removed words struck
  through and new ones underlined, compared word by word. A bar under the text steps through them
  (Previous / Next) and accepts or rejects each one, or all at once. Nothing changes in the document
  or in `value` until a change is accepted; each Accept is one undo step. New file
  `rich-text-review.tsx`, installed with the editor; new `ai.review` option (`false` removes it).
- `NodeEditor`: the node panel has Settings, Input and Output tabs. `runs` takes each node's
  `input` and `output`; Input falls back to the output of the node before it.
- `NodeEditor`: text fields take `{{ path }}` expressions. Typing `{{` (or the braces button)
  suggests the input's fields, the app's `variables` and earlier nodes' outputs
  (`$node.<id>.<path>`) with a sample each; a preview under the field fills them from the sample.
  `expression: false` turns it off for a field.
- `NodeEditor`: `onRunNode({ node, input, workflow })` adds "Test node". The app runs that one node
  and resolves with `{ status?, output?, message? }`, shown on the card and under Output and offered
  to the nodes after it.
- `NodeEditor`: new field types — `conditions` (rules matched all or any, with the result for the
  sample), `keyValue` (rows of key and value), `code` (monospace; JSON is checked and an invalid one
  is an issue with the code `invalid`) and `credential` (one of the app's `credentials`, ids and
  names only; `onCreateCredential` adds "New credential").
- `node-editor-fields`: `resolveExpression`, `evaluateConditions`, `keyValuesToObject`, `dataPaths`,
  `readPath`, `jsonError` — path lookup only, nothing is evaluated.
- `WorkflowBuilder` passes the new props through `editorProps`; `AgentBuilder` takes `onRunNode` and
  offers its state fields in expressions.
- `NodeEditor` (`@coreloom/node-editor`): an n8n-style canvas on React Flow (`@xyflow/react`).
  The app declares its node kinds (ports, settings as data, icon, a summary line); people add nodes
  from a searchable list, drag them, draw connections from an output to an input, and configure the
  selected node in a side panel that also lists and makes connections, so everything works from the
  keyboard. Undo/redo, tidy up, zoom; missing settings and loose ends are flagged; `runs` shows what
  the app's run reports for each node. Nothing runs inside. Pure helpers for app code: `addNode`,
  `connectNodes`, `canConnect`, `removeNodes`, `updateNode`, `duplicateNode`, `layoutWorkflow`,
  `validateWorkflow`, `nodePorts`.
- `WorkflowBuilder` (`@coreloom/workflow-builder`): an automation's page — name, Save, Run (which
  waits until no node needs attention) — above the node editor.
- `AgentBuilder` (`@coreloom/ai-agent-builder`): design an agent graph the LangGraph way — shared
  state with replace/append reducers, Agent, Tools, Function, Router (conditional edges, one output
  per route), Human review and Subgraph nodes between START and END. `toLangGraphJSON` /
  `fromLangGraphJSON` read and write the shape of LangGraph's `get_graph().to_json()`; `onSave` and
  `onRun` get the graph and that JSON. No dependency on LangGraph.
- `NodeEditor`: notes and groups on the canvas. `Workflow.notes` (`{ id, position, width, height,
text, color? }`) and `Workflow.groups` (`{ id, position, width, height, label, color? }`) sit behind
  the cards and are never run nor checked. Add them from the toolbar or the canvas menu; Ctrl/⌘+G
  groups the selection. Text and names are edited in place, both resize from handles and take a
  colour from their right-click menu; moving a group moves what's inside, and Tidy up refits groups.
- `NodeEditor`: "Find on the canvas" (Ctrl/⌘+F) lists nodes, notes and groups; picking one selects
  it, brings it into view and focuses it.
- `NodeEditor`: a minimap (React Flow's `MiniMap`, pannable and zoomable) with a toolbar toggle; the
  `minimap` prop (default true) removes both when false.
- Helpers in `node-editor-canvas`: `addNote`, `addGroup`, `updateNote`, `updateGroup`, `moveGroup`,
  `groupMembers`, `removeCanvasItems`, `refitGroups`.
- `NodeEditor`: pinned sample data. `WorkflowNode.pinned` holds a sample output, set from Output
  ("Pin this output", or "Add sample data" as JSON). It stands in while no run reports an output, and
  a node without output passes its input on, so a sample pinned to the trigger feeds every node after
  it.
- `NodeEditor`: drag a field from the Input tab onto a setting; it lands as `{{ path }}`.
- `NodeEditor`: "+" after unconnected outputs and on connections adds a node there, connected;
  right-click menus for nodes, connections and the canvas; Ctrl/⌘+C / X / V copy, cut and paste
  nodes with their connections (also through the system clipboard); D or `WorkflowNode.disabled`
  disables a node (dimmed, not checked).
- Helpers: `insertNodeOnEdge`, `copyNodes`, `pasteNodes` (untrusted input is filtered).

### Changed

- `AgentGraph`: an agent selected out of sight (from the panel's links, say) scrolls into view.
- `AgentGraph`: without `defaultView`, a box too narrow to read the graph (a phone) starts on the
  list view.
- `RichTextEditor`: for a rewrite, **Review changes** is now the main (focused) button in the AI
  panel, and Replace is next to it. Translations, summaries, continuations and answers at the `/`
  spot keep their main action.
- `NodeEditor`: key/value rows put the key above the value, so both stay readable in the panel.
- `updateNode` takes `disabled` and `pinned`; `undefined` (or `disabled: false`) removes the key.
- Every registry item that has a guide now links it: the published `r/<name>.json` and
  `r/registry.json` end the item's description with `Guide: <url>` and carry the same links in
  `docs`. Assistants that browse `@coreloom` through shadcn's MCP server (which only shows
  descriptions) can now open the guide: when to use the item, its props and accessibility rules.
- README: setting up shadcn's MCP server for Codex and OpenCode, and for any other MCP client.

### Fixed

Gauge: the number, label and status now sit on the ring's center and stay inside the threshold ticks. The number shrinks to fit when it's long ("99.32 %", "7.4M"), and the text scales with `size`.

- `removeNodes` kept only `nodes` and `edges`; it now keeps the rest of the workflow.

### Upgrading

- New strings in `ai.agentBuilder`: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. The block now also needs
  `@coreloom/radio-group`.
- Both items read new strings (`ai.agentGraph`, `ai.agentTeams`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- These read new strings (`ai.plan`, `ai.toolForm`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) and `@coreloom/ai` with `--overwrite`
  first, then `@coreloom/tool-call` and `@coreloom/ai-chat`.
- `AgentTeams` reads a new string (`ai.agentTeams.edit`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- `ai-agent-builder` now depends on `@coreloom/agent-graph` (types only).
- The panel reads new strings (`ai.artifact`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` before adding
  `@coreloom/ai-artifact`.
- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
- The new items read new strings (`charts`): re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. Re-installing the app-shell or
  dashboard block pulls in `@coreloom/sparkline` for `StatCard`.
- The editor reads new strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first, then
  `@coreloom/rich-text-editor` with `--overwrite`.
- To keep Replace as the main action, pass `ai={{ onRequest, review: false }}`. Tests that press
  Enter on the panel's focused button after a rewrite now start a review instead of replacing.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`:
  it now has a second file, `node-editor-fields.tsx`, and needs `@coreloom/tabs`.
- `text` and `textarea` fields now take expressions and show the braces button; add
  `expression: false` where that isn't wanted.
- `WorkflowIssue` has a new code, `invalid`: handle it if you switch over the codes.
- The new items read new strings (`nodeEditor`, `workflow`, `ai.agentBuilder`): re-install
  `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with
  `--overwrite` first.
- `@coreloom/node-editor` adds the `@xyflow/react` dependency and imports its base stylesheet
  (`@xyflow/react/dist/base.css`) from the component.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite` (new `nodeCanvas` group), then
  `@coreloom/node-editor`, which adds `node-editor-canvas.tsx`.
- If your app stores or executes workflows, keep `notes` and `groups` when you save, and ignore them
  when you run.
- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite`, then `@coreloom/node-editor`
  (it now uses `@coreloom/context-menu`).
- If your run executes the graph, skip nodes with `disabled: true` (pass their input on), and decide
  whether a `pinned` output replaces running the node.

## [0.9.0] - 2026-11-01

### Added

- Generative UI: `Chat` (and `ChatWidget`, `ChatMessages`, `ChatMessage`) take `tools`, a map from
  tool name to `{ render, label, display }`, so a tool call shows as your own component (a weather
  card, a list of results) instead of JSON. `render` gets the call in every state, narrowed by
  `state` (`output` once it answers, a partial `input` while it streams, `respond(approved)` while it
  asks); returning `undefined` keeps the usual card for that state. `display: 'inline'` draws the
  component in place of the card, as a group named after the tool and busy until it answers.
- `ToolCall`: a `tool` prop takes the same object. New types `ToolComponent`, `ToolComponents`
  (typed from your tools: `ToolComponents<InferUITools<typeof tools>>`), `ToolRenderProps` and
  `ToolRenderState`.
- A Generative UI guide.

### Fixed

- `ToolCall`: after Allow or Deny, focus moves to the card instead of being lost with the buttons.

## [0.8.0] - 2026-10-31

### Added

- AI components: `PromptInput` (Enter sends, Shift + Enter breaks the line, Send becomes Stop while
  streaming, attachments), `Markdown` (model output with GFM tables, task lists and code blocks
  with Copy; raw HTML skipped), `Reasoning` (thinking folded under "Thought for N s") and
  `ToolCall` (a tool's state, input, output or error, and Allow / Deny when it needs approval).
- AI blocks: `ai-chat` (`Chat` with reasoning, tool calls, sources, copy, regenerate, feedback,
  a live log and stick-to-bottom scrolling; `ConversationList` with search, day groups, rename and
  delete), `ai-agents` (`AgentList`, `AgentEditor` with `{{variables}}` and ask-first tools),
  `ai-runs` (`RunList`, `RunTrace` waterfall), `ai-playground` and `ai-knowledge`
  (`KnowledgeBase`, `RetrievalTest`). `@coreloom/ai` types read the AI SDK's `UIMessage` parts as
  they are (checked against `ai` 7 in the unit tests); nothing depends on the SDK or calls an API.
- Starter: Assistant, Agents, Runs, Playground and Knowledge pages on in-memory data, with a
  simulated `useChat` (the `@coreloom/demo-chat` item, `src/hooks/use-demo-chat.ts`); the README
  shows the swap to `@ai-sdk/react`.
- `InlineCitation`: numbered source pills in a model's text; hover or focus shows the source,
  click, tap or Enter keeps it open. `Markdown` takes `sources` and turns `[1]` markers into
  citations (not in code or links, and safe while streaming).
- AI chat: edit a sent message (`onEdit`; Escape cancels, ⌘/Ctrl + Enter saves) and switch between
  versions of a message (`branches` + `onBranchChange`, "‹ 2 / 3 ›", announced).
- `ModelPicker` (with `ModelList`, and `ModelField` for the form kit as its own item): a searchable list of models
  grouped by provider, with context window, price per million tokens and capabilities.
  `ContextMeter`: how full the context window is, as a ring or bar with the token breakdown and
  estimated cost. `AiModel` gains optional `contextWindow`, `pricing`, `capabilities`, `disabled`;
  new `AiUsage` and helpers (`formatTokens`, `estimateCost`, `contextLevel`…).
- `ai-chat-widget` block: the support bubble in a page's corner — a launcher with an unread count
  and a greeting, opening the Chat in a card (a full-screen sheet on phones).
- `RichTextEditor` takes an optional `ai` prop: an AI button and ⌘/Ctrl + J open a panel to rewrite
  or write with your own `onRequest` (quick actions, streamed preview with Stop, Replace / Insert
  below / Try again). Answers are inserted as text, never HTML.
- `CommandMenu` and `AppShell` take `onAskAi(query)`: "Ask AI: “…”" comes first in the ⌘K results.
  `CommandDialog` takes a cmdk `filter`.
- Starter: the assistant has a model picker, a context meter, inline citations and editable
  messages; "Ask AI" in ⌘K opens it with the question; project notes have the editor's AI panel.
- Storybook: a page per AI component with Controls, frozen streaming states (waiting, thinking,
  answering), attachments and document sources, a tool result drawn as UI, empty states, a failing
  playground variant, a running trace, French versions, and a "With the AI SDK" guide.
- New logo: Coreloom's ginger cat, redrawn on a 256 grid from three shapes (head, eyes cut out, cyan
  slit pupils) so it holds at 16 px and in one colour; dark, light, one-colour, small-size and tile
  versions with lockups. Storybook's sidebar and tab and the starter's brand and favicon use it.
- `DataTable` `virtual`: thousands of rows in a fixed-height box, only the visible ones rendered
  (TanStack Virtual), header pinned, `aria-rowcount` / `aria-rowindex` for screen readers.
- `VirtualList`: a long list with measured item heights and load-more at the end, made for
  `useInfiniteQuery`.
- Guidelines in Storybook: a page per component and block (when to use it, what it takes, its
  rules, a live example), from the design system's guides; CI checks each one renders.
- Design tokens in the DTCG format (2025.10) at https://eldenn.github.io/coreloom-ui/tokens/ and on
  each release: base, dark and light files plus a resolver, for Figma, Style Dictionary or native
  apps. `pnpm tokens:dtcg` writes them; unit tests check every colour against `tokens.css`.
- `ForgotPasswordForm` and `ResetPasswordForm` in the `auth` block. The first confirms without
  saying whether the account exists and moves focus to its new heading; the second checks the two
  passwords against each other and hands the account's email to password managers.
- `AccentPicker` and `useAccent()` in `@coreloom/theme-toggle`: one swatch per preset, a radio
  group, saved in `localStorage("accent")`. `accents.css` gains a `cyan` preset that brings the
  default back inside an element with another accent.
- Starter: sign-up with an emailed code, forgot / reset password, Settings → Appearance (theme and
  accent, applied before the first paint), and project notes in the rich text editor, loaded with
  `React.lazy` so Tiptap downloads only on project pages.
- `@coreloom/demo-chat`: `useDemoChat`, a stand-in for the AI SDK's `useChat` that simulates a
  model in the browser (reasoning, a tool call, an approval, a streamed answer citing a source), to
  prototype AI screens with the Chat block before there is a backend. Configurable `script` (tool,
  source, approval tool, speed). The starter now installs it from the registry.
- For AI assistants: `llms.txt` (every item with its install name and guide), `llms-full.txt`
  (all guides in one file) and `guides/*.md`, published with the site; the README shows how to turn
  on shadcn's MCP server so Claude Code, Cursor or VS Code can install `@coreloom/*` items. The
  starter ships `.mcp.json`.
- `RichTextEditor`: with `ai` set, typing `/` at the start of a line or after a space opens a menu of AI commands
  (Ask AI…, Continue writing and the quick actions), filtered as you type, keyboard-driven and
  announced to screen readers. Choosing opens the AI panel where the slash was; **Insert here**
  puts the answer there (and is the focused button; **Replace all** stays a click away). The menu
  works inside dialogs and sheets; Enter right after a lone `/` is a plain new line. Turn it off
  with `ai.slashCommand: false`. Continue writing sends the `'continue'` action, whose `text` is the
  document before the cursor: handle it in your `onRequest`.
- Theme generator: from one brand colour, `generateAccent(hex)` (`@coreloom/accent`) builds the
  whole accent family for both themes, checks every contrast pairing (adjusting lightness when a
  check fails) and writes a `brand.css` to import after `accents.css` (`data-accent="<name>"`).
  Try it on the Storybook page Foundations → Theme generator, or run
  `pnpm brand "#ff5a1f" --name orange > brand.css`.
- Repository: unit tests (Vitest, `pnpm test:unit`) for the parsers and formatters (money, phone,
  typed dates, file sizes, emails); visual tests of every block at phone width (390 px); weekly
  Renovate pull requests, nothing younger than 14 days; and the **Visual baselines** workflow now
  starts **Registry & Storybook** after committing the screenshots.

### Changed

- Light theme: `accent` `#009f96` → `#00968d` and `accent-fg` `#007270` → `#006f6c`. The accent
  fill was 2.9:1 on `surface-inset`, under the 3:1 non-text minimum; it is now 3.1:1 or more on
  every surface. The change is barely visible.

### Fixed

- AI blocks: `KnowledgeBase` with no documents says so instead of showing an empty table; ids in
  `AgentEditor`, `RunTrace`, `Playground` and `RetrievalTest` come from `useId`, so two on a page
  don't clash; a running trace step says "Running" to screen readers.
- `ToolCall`: a `renderOutput` that returns `undefined` falls back to JSON (the chat used to show
  nothing), a drawn result shows unfolded, long tool names wrap, and its Input / Output / Error
  labels are no longer headings (they broke the page's heading order).
- `Markdown`: a code block that scrolls sideways takes focus, so keyboard users can scroll it;
  footnotes are translated, labelled with a paragraph instead of a heading, get ids of their own per
  block, and in-page links no longer open a new tab.
- AI chat: source links are limited to http(s) and mailto (others show as text).
- Starter: the French workspace URL hint was in English.

### Upgrading

- The new items read new strings in every locale: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first, then add them.
- Re-install `@coreloom/theme` with `--overwrite` for the new light accent and the `cyan` preset,
  then update your own visual baselines if you keep screenshots.

## [0.7.0] - 2026-10-30

### Added

- `MultiSelect`: several values from a list, chips in the trigger, a searchable checklist with
  select all / clear and an optional maximum. Form field: `MultiSelectField`.
- `MoneyInput`: an amount typed the locale's way ("1 234,50"), the currency symbol where the locale
  puts it, a `number | null` value rounded to the currency's decimals. Form field: `MoneyField`.
- `PhoneInput`: a searchable country picker and the national number in its usual grouping; the
  value is E.164, `isValidPhone()` checks it. Form field: `PhoneField`.
- `DatePicker` `typing`: a text input that reads dates in the locale's order, with the calendar a
  button away; impossible dates are refused with the expected format. `DateField` passes it on.
- `DataTable` `server`: the API sorts, searches and pages; `query` / `onQueryChange` / `rowCount`
  / `loading`. Starter: a Deployments page keeps that query in the URL and fetches it with
  TanStack Query.
- `RichTextEditor`: Tiptap with a Coreloom toolbar (marks, headings, lists, quote, code, links,
  undo), Markdown shortcuts, an HTML value; `RichTextField` for the form kit lives beside it so
  `@coreloom/form` doesn't pull in Tiptap. The form kit now exports `useFieldMeta`,
  `VerticalShell` and `describedBy` for custom fields.
- Blocks: `notifications` (bell, unread count, all / unread, mark read), `team` (members, roles,
  invites with checked emails, confirmed removal), `billing` (plan, usage meters, payment method,
  invoices), `kanban` (drag and drop with pointer or keyboard, announced, plus a Move to menu; WIP
  limits) and `event-calendar` (month grid, agenda on phones, locale week start).
- Starter: notifications in the header (TanStack Query, optimistic mark-as-read), and Members and
  Billing settings sections.
- Accent presets: `accents.css` (part of `@coreloom/theme`) adds blue, violet, amber and rose,
  set with `<html data-accent>`; every pairing is checked in both themes by `build/gen-accents.py`
  and by axe in CI. Storybook has an Accent toolbar.
- Spanish and German: `@coreloom/i18n-es` and `@coreloom/i18n-de`, passed as `messages`. Storybook's
  Language toolbar has them, and CI runs axe in both.
- The starter runs as a live demo at https://eldenn.github.io/coreloom-ui/starter/, deployed with
  Storybook. It honours Vite's `base` as the router's basepath, so it also works under a sub-path.
- `CardTitle` takes `asChild` to render your own heading element with the card title's style.

### Fixed

- `LoginForm`, `SignupForm` and `VerifyForm` title the page with an `<h1>` (it was a `<div>`), so
  screen-reader users can find it from the headings list.
- Starter: the dashboard's demo activity follows the app's language.

### Upgrading

- The new components read new strings: re-install `@coreloom/i18n` with `--overwrite` first
  (it holds English and French), then add them.
- Re-install `@coreloom/auth` with `--overwrite` for the `<h1>` titles, and `@coreloom/card` for
  `CardTitle asChild`.

## [0.6.0] - 2026-10-29

### Added

- **Starter** (`starter/`): a Vite + React app on TanStack Router (file routes), TanStack Query
  and TanStack Form, with the Coreloom components, providers, theme script, English and French,
  and these screens wired: sign in, dashboard, projects (filters in the route's search params),
  project detail, settings, 404 and error. Demo data is local; no API. Start one with
  `pnpm dlx degit Eldenn/coreloom-ui/starter my-app`.
- **Interaction tests** in CI (`tests/interactions.spec.ts`): keyboard and pointer behaviour of
  the inputs, the form kit, the data list's URL state, the onboarding wizard, the theme menu,
  dialogs and menus, run against the built Storybook next to the a11y and visual tests. The
  starter is built in CI and tested end to end, with axe on every screen in both themes.
- `@coreloom/link`: `CoreloomLinkProvider` hands the blocks your router's link, so the sidebar,
  breadcrumbs, settings nav, auth and error pages navigate client-side (TanStack Router, Next.js…).
  Without a provider they render a plain `<a>`, as before.
- `CHANGELOG.md` and the **Release** workflow: pushing a `v*` tag checks the version, then
  publishes a GitHub release with this file's notes and the registry JSON attached.

### Changed

- `FileUpload` sizes read "78 B" / "2.3 MB" ("78 o" / "2,3 Mo" in French) instead of "78 byte".

### Fixed

- Next.js: a server component passing the same icon element twice (two nav items with
  `<HomeIcon />`) made the build fail with "Element type is invalid". The blocks now render any
  icon that isn't a component as a node.

### Upgrading

- Blocks now import `@/lib/link`: re-install them with `--overwrite` (or
  `pnpm dlx shadcn@latest add @coreloom/link`). Next.js: `<CoreloomLinkProvider component={Link}>`
  with `Link` from `next/link`, in your client providers.

<!-- 0.1.0 to 0.5.0 predate the release workflow and have no tags. -->

## [0.5.0] - 2026-10-29

### Added

- Components: `DateRangePicker` (two months, shortcuts), `TagsInput`, `FileUpload` (drop zone,
  thumbnails, progress, type / size / count checks) and `Stepper`.
- Form kit fields: `DateRangeField`, `TagsField`, `FileField`.
- Blocks: `dashboard` (stat grid, trend chart, activity feed), `data-list` (search, faceted
  filters, pagination, state in the URL), `pricing` (monthly / yearly), `onboarding`
  (multi-step wizard) and `error-pages` (404, 500, maintenance).
- `ThemeMenu`: Light, Dark or System; System follows `prefers-color-scheme` live.

### Changed

- The app shell's header uses `ThemeMenu` instead of `ThemeToggle`.
- `useTheme()` returns `{ theme, preference, setTheme, toggleTheme }`; `preference` can be
  `"system"`.

### Upgrading

- Replace the anti-flash script in `index.html` / the root layout with the new one from the
  getting-started guide, which also handles `"system"`.

## [0.4.0] - 2026-10-29

### Added

- `@coreloom/i18n`: `CoreloomI18nProvider` and `useCoreloomI18n()`. Every built-in string
  (labels, placeholders, screen-reader text, validation messages) in English and French,
  overridable per string; dates follow the date-fns locale.
- Next.js App Router support, verified with a production build: blocks accept icons as elements
  (`icon: <HomeIcon />`) so server components can pass them.

### Upgrading

- Components now read their strings from the i18n context; English is used without a provider.
  Re-install with `--overwrite` to get `src/lib/i18n.tsx`.

## [0.3.0] - 2026-10-29

### Added

- `@coreloom/form`: TanStack Form kit (`useAppForm`) with text, textarea, select, combobox,
  date, radio, checkbox, switch and one-time-code fields, a submit button and form-level errors;
  Standard Schema validation (zod).
- CI tests: axe on every story (dark, light, French) and screenshots of every story compared
  with baselines from the **Visual baselines** workflow. Pages deploy only when they pass.

### Changed

- The `auth` and `settings` blocks use the form kit, with validation and a submitting state.

## [0.2.0] - 2026-10-29

### Changed

- Accessibility pass: token contrasts raised to WCAG AA (muted text, strong borders, focus ring,
  accent and status colours in light), every story axe-clean.

## [0.1.0] - 2026-10-29

### Added

- The registry: theme (tokens, fonts, Tailwind mapping), 54 components on shadcn/ui (Radix) and
  the blocks `app-shell`, `auth`, `settings`, `marketing` and `docs`.
- Storybook with a theme switch and the accessibility panel, published on GitHub Pages.

[0.10.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.10.0
[0.9.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.9.0
[0.8.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.8.0
[0.7.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.7.0
[0.6.0]: https://github.com/Eldenn/coreloom-ui/releases/tag/v0.6.0
