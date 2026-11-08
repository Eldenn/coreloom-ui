# Contributing to Coreloom UI

Thanks for taking the time. Bug reports, fixes, guides and new components are all welcome.

Coreloom UI is a shadcn registry: `shadcn add @coreloom/<item>` copies our files into an app, where they
become that app's code. So every file has to read well on its own, and every change is described for
someone who already installed the item.

## Before you start

- **Bugs:** open an issue with the [bug form](https://github.com/Eldenn/coreloom-ui/issues/new?template=bug_report.yml).
  A small reproduction (a story, a StackBlitz, or the steps in the starter) gets it fixed fastest.
- **New components, blocks or props:** open a
  [request](https://github.com/Eldenn/coreloom-ui/issues/new?template=component_request.yml) first, so we
  agree on the API before you write it.
- **Security issues:** never in a public issue. See [`SECURITY.md`](./SECURITY.md).
- **Questions:** [Discussions](https://github.com/Eldenn/coreloom-ui/discussions).

Small fixes (a typo, a broken link, an obvious bug) can go straight to a pull request.

## Set up

You need Node 22 and pnpm. With [mise](https://mise.jdx.dev), `mise install` sets up both from
`mise.toml`; otherwise the pnpm version is pinned in `package.json` and `corepack enable` picks it up.

```bash
pnpm install                 # only installs versions published ≥ 14 days ago
pnpm storybook               # http://localhost:6006
```

The commands you will use most:

```bash
pnpm format                  # Prettier (CI runs format:check)
pnpm lint                    # ESLint, type-aware, zero warnings
pnpm typecheck               # library, stories and tests
pnpm test:unit               # Vitest
pnpm docs:check              # guides ↔ props
pnpm api:report              # after changing what an item exports (CI runs api:check)
pnpm storybook:build         # then: pnpm test (Playwright, against the build)
pnpm starter:sync            # after changing an item the starter uses
pnpm changeset               # describe your change for the CHANGELOG
```

Run one Playwright area instead of the whole suite while you work:

```bash
pnpm exec playwright test a11y interactions -g "Components/Forms/Select"
```

Visual baselines come only from CI's container; never commit screenshots taken on your machine. A
maintainer runs the **Visual baselines** workflow after merging a change that alters what renders.

## Making a change

[`AGENTS.md`](./AGENTS.md) holds the full rules: they are what CI and review check, whether a person or a
coding agent writes the code. In short:

- **Tokens only** (no hex values or raw Tailwind palette), the `z-*` ladder for layers, the focus ring on
  every control, motion that respects `prefers-reduced-motion`.
- **Accessible by default:** a name for every control, everything works with the keyboard, focus is never
  lost, status is never in colour alone. axe runs on every story in both themes and four languages.
- **No hard-coded text:** add every string to the four locales (`en`, `fr`, `es`, `de`) in `src/lib/`.
- **Front-end only:** nothing in `src/` calls the network; async work is a callback the app provides.
- **A new component or block** comes with its `registry.json` item, stories for each state, a guide in
  `stories/guidelines/`, and tests for its behaviour.

## Changesets

Every pull request that changes what ships (`src/`, `registry.json`) has a changeset. Run
`pnpm changeset`, pick the bump, and write the entry for someone who installed the item, under `### Added`,
`Changed`, `Deprecated`, `Removed`, `Fixed` or `Security`, plus `### Upgrading` when they must do
something. Don't edit `CHANGELOG.md` or `version`: the release writes them. README → Develop shows an
example.

Changing a stable item's API follows [`VERSIONING.md`](./VERSIONING.md): renaming or removing
something is a major release, so deprecate it first and keep it working until then.

## Commits and pull requests

- Commit messages and pull request titles follow
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  `feat(timeline): add a compact variant`, `fix(select): keep focus on the trigger after closing`.
  Pull requests are squash-merged, so the title becomes the commit on `main`.
- Branches are named `<type>/<short-description>`, such as `fix/select-focus`.
- Fill in the pull request template: what changed and why, how you checked it, and screenshots at
  1280 px and 390 px in dark and light when something renders differently.
- Keep a pull request to one change. A refactor goes in its own commit, separate from behaviour changes.

## License

By contributing, you agree that your contributions are licensed under the project's
[MIT License](./LICENSE), the same license the project is distributed under.

Everyone taking part follows the [Code of Conduct](./CODE_OF_CONDUCT.md).
