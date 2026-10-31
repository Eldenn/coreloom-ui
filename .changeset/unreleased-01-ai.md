---
'@coreloom/ui': minor
---

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

### Upgrading

- The new items read new strings in every locale: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first, then add them.
