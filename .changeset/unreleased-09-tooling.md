---
'@coreloom/ui': minor
---

### Added

- Unit tests (Vitest, `pnpm test:unit`, run in CI) for the parsers and formatters: money, phone,
  typed dates, file sizes, emails.
- Visual tests also take every block at phone width (390 px).
- Renovate: weekly dependency PRs for the registry and the starter, nothing younger than 14 days
  (as in `pnpm-workspace.yaml`), grouped by family; Playwright and its CI container move together.

### Changed

- The **Visual baselines** workflow starts **Registry & Storybook** after committing, so main is
  tested and Pages deployed with the new screenshots.
