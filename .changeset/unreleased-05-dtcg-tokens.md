---
'@coreloom/ui': minor
---

### Added

- Design tokens in the DTCG format (2025.10) at https://eldenn.github.io/coreloom-ui/tokens/ and on
  each release: base, dark and light files plus a resolver, for Figma, Style Dictionary or native
  apps. `pnpm tokens:dtcg` writes them; unit tests check every colour against `tokens.css`.
