---
'@coreloom/ui': patch
---

### Changed

- Every registry item that has a guide now links it: the published `r/<name>.json` and
  `r/registry.json` end the item's description with `Guide: <url>` and carry the same links in
  `docs`. Assistants that browse `@coreloom` through shadcn's MCP server (which only shows
  descriptions) can now open the guide: when to use the item, its props and accessibility rules.
- README: setting up shadcn's MCP server for Codex and OpenCode, and for any other MCP client.
