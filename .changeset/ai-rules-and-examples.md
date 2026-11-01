---
'@coreloom/ui': minor
---

### Added

- `@coreloom/rules`: installs `AGENTS.md` at the app's root with the Coreloom design,
  accessibility and text rules, so coding agents follow them on every change.
- Usage examples for assistants: every Storybook story file is published as a `registry:example`
  item (`button-demo`, `overlays-demo`, `ai-chat-demo`…, 42 in all, covering every component). shadcn's
  MCP server returns their code when an assistant asks for an example.
