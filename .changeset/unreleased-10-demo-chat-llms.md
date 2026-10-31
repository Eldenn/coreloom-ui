---
'@coreloom/ui': minor
---

### Added

- `@coreloom/demo-chat`: `useDemoChat`, a stand-in for the AI SDK's `useChat` that simulates a
  model in the browser (reasoning, a tool call, an approval, a streamed answer citing a source), to
  prototype AI screens with the Chat block before there is a backend. Configurable `script` (tool,
  source, approval tool, speed). The starter now installs it from the registry.
- For AI assistants: `llms.txt` (every item with its install name and guide), `llms-full.txt`
  (all guides in one file) and `guides/*.md`, published with the site; the README shows how to turn
  on shadcn's MCP server so Claude Code, Cursor or VS Code can install `@coreloom/*` items. The
  starter ships `.mcp.json`.
