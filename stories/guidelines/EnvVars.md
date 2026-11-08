# Environment variables

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A project's environment variables, one tab per environment (Production, Preview, Development), plus **Compare** to line them up.

**The consumer provides** `<EnvVars environments variables onSet onDelete onImport title description>`: `environments` are `{ id, name }`, `variables` are `{ key, values: { [environmentId]: value }, secret? }` (a missing value is not set there). `defaultEnvironment` picks the first tab (an environment id, or `compare`). The callbacks call your API:

- `onSet({ key, value, secret, environments })` adds a variable to the chosen environments, or edits its value in the open one. It shows **Add variable** and the edit buttons.
- `onDelete(key, environment)` removes it from one environment, after a confirm.
- `onImport(environment, entries)` sets every `{ key, value }` of a pasted `.env` in the open environment. The dialog reads the text with `parseDotenv` (`@coreloom/dotenv`: comments, `export`, quotes and escapes), says how many variables it found and which replace a value, and lists the lines it couldn't read before anything is sent.

- Secret values show masked, with Reveal and Copy (SecretValue); in Compare only their last 4 characters show. Mark everything secret that isn't public configuration.
- Compare is a table of names by environments with **Same**, **Differs** or **Missing** for each (`compareEnvironments` gives the same as data).
- Names are checked (letters, digits and `_`, not starting with a digit). A rejected promise keeps the dialog open.
- Focus goes back to the button that opened a dialog, and to the list after a delete.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/env-vars`.
