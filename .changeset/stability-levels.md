---
'@coreloom/ui': minor
---

### Added

- [`VERSIONING.md`](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md) says what a
  version promises: the API it covers (item names, exports, props, tokens, message keys), what
  makes a major, minor or patch release, how deprecations work and which platforms are supported.
- Items carry a stability level. These are **experimental**, and may still change in a minor
  release: `uml`, `uml-diagram`, `diagram-code-block`, `diagram-editor`, `diagram-card`,
  `diagram-viewer`, `diagram-workspace`, `share-dialog`, `access-code-gate`, `node-editor`,
  `workflow-builder`, `agent-graph`, `ai-agent-builder`, `ai-agent-teams`, `terminal`,
  `terminal-console`, `ansi-output`, `ide`, `pipeline-run`, `form-builder` and `form-renderer`.
  Their registry entry has `"meta": { "stability": "experimental" }`, their guide opens with a
  note, and `llms.txt` marks them. Every other item is stable.
