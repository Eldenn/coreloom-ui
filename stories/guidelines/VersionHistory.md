# Version history

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The saved versions of a document, a diagram or a prompt: a list by day (who and when, a name for the ones that matter), the selected version or its changes, **Name** and **Restore**.

**The consumer provides** `<VersionHistory versions currentId onRestore onRename renderPreview>`: `versions` are `{ id, createdAt, name?, author?, summary?, content? }` in any order; `currentId` is the version in use (the newest by default). Optionally `defaultSelectedId` and `defaultCompare` (`previous`, `current` or `none`).

- With `content`, the selected version shows its changes against the one before it, or the current one (DiffViewer); with nothing to compare, its text. `renderPreview(version)` draws versions that aren't text (a diagram, a rendered page).
- `onRename(id, name)` makes the version's name editable in place ('' clears it); **Named versions only** narrows the list to them.
- `onRestore(id)` adds **Restore**, after a confirm. Most apps save the old content as a new current version, so nothing is lost.
- The list is a navigation landmark; the selected version is marked `aria-current`. On a phone the list sits above the preview.
- `groupVersionsByDay` and `comparedVersion` are the list's grouping and the comparison choice as plain functions.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/version-history`.
