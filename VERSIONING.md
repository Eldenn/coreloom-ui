# Versioning and stability

Coreloom UI follows [Semantic Versioning](https://semver.org) from 1.0.0. Because `shadcn add` copies
files into your app, "breaking" means: re-installing an item at the new version (`--overwrite`) makes
code that used it stop compiling, or stop behaving as its guide says. This page says what that covers,
what doesn't count, and how changes are announced.

## What the version covers

The public API of every **stable** registry item:

- **Item names**: `@coreloom/<item>`, and the items a group (`all`, `charts`, `editors`, `everything`)
  installs.
- **Exports**: the components, hooks, helpers and types an item's files export, and the paths they
  install to (`@/components/ui/<name>`, `@/components/<name>`, `@/lib/<name>`).
- **Props**: their names, types, defaults and the behaviour the item's guide describes (keyboard,
  focus, what is announced, controlled and uncontrolled use).
- **Theme**: the CSS custom properties in `tokens.css`, the Tailwind utilities `theme.css` maps
  (`bg-primary`, `text-muted-foreground`…), the attributes it reads on `<html>` (`data-theme`,
  `data-accent`, `data-surface`), and the `z-*` and `duration-*` utilities.
- **Text**: the message keys of `useCoreloomI18n()` and the shape of each message (a string, or a
  function and its arguments).
- **npm dependencies**: a new major of a dependency an item installs is a major release.

## Major, minor or patch

| Release   | What it may contain                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Major** | A stable item, export, prop, token, utility or message key renamed or removed; a prop's type narrowed or its default changed in a way you would notice; a dependency's new major. Always with **Upgrading** steps. |
| **Minor** | New items, props, exports, tokens, variants and message keys; a deprecation; any change to an **experimental** item (with **Upgrading** steps when it breaks); visual refinements within the design system.        |
| **Patch** | Bug fixes, accessibility fixes and translation fixes that keep the API as documented.                                                                                                                              |

Not covered, and so possible in any release:

- Internal markup, class names, `data-slot` attributes and private helpers, as long as the documented
  behaviour holds. Style the components through their props, variants and tokens, not through their
  inner DOM.
- Small visual changes: spacing, a shade within the same token, an animation's curve. They are listed
  under **Changed** in the changelog, and the visual tests make every one of them deliberate.
- Fixing behaviour that contradicted its guide or the accessibility rules, even if an app relied on it.
- Demo data, stories, the starter's own app code and the build scripts in this repository.

## Stable and experimental items

Every item is stable unless its entry in `registry.json` says `"meta": { "stability": "experimental" }`.
An experimental item is complete and tested, but its API is still settling: it may change in a minor
release. Its guide opens with an **Experimental** note, and `llms.txt` marks it too. An item becomes
stable in a minor release, announced under **Changed**; from then on the rules above apply.

`pnpm docs:check` (in CI) fails when an item's stability and its guide disagree.

## Deprecations

Nothing stable disappears without warning:

1. A minor release marks it deprecated: `@deprecated` in its JSDoc (your editor strikes it through),
   the replacement named in the guide, and a **Deprecated** entry in the changelog saying what to use
   instead.
2. It keeps working for at least one more minor release.
3. The next major removes it, with **Upgrading** steps.

CI holds stable items to this. `api/` records every item's exports and props, one per line
(`pnpm api:report` writes it), so a pull request shows exactly what an API gains or loses.
`pnpm api:check` fails when `api/` doesn't match the code, and when a stable item loses an export or
a prop, or a component of one gains a required prop, without a pending major changeset.

## How changes are announced

Each release has a section in [`CHANGELOG.md`](./CHANGELOG.md) and on
[GitHub Releases](https://github.com/Eldenn/coreloom-ui/releases), under **Added**, **Changed**,
**Deprecated**, **Removed**, **Fixed** and **Security**, and **Upgrading** when you have something to
do. The `@coreloom` namespace serves the latest release; `main` is published under `/next/` (see the
README).

Re-installing is your choice: installed files are yours. Review with `shadcn add … --diff` before
`--overwrite`, then diff with `git`.

## Supported platforms

| What           | Supported                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------- |
| React          | 19                                                                                              |
| Tailwind CSS   | 4                                                                                               |
| shadcn CLI     | The current major (`shadcn@latest`), with namespaced registries, in a project on the Radix base |
| Browsers       | The last two versions of Chrome, Edge, Firefox and Safari (desktop and mobile)                  |
| Languages      | English, French, Spanish and German built in; any other through `CoreloomI18nProvider`          |
| Writing        | Left to right. Right-to-left layouts are not supported yet                                      |
| Node.js (repo) | 22, to develop this repository; apps only need what their framework needs                       |

Raising the minimum version of React, Tailwind CSS or the shadcn CLI is a major release. Dropping a
browser version that has left the "last two" is not.
