# Feature flags

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A product's feature flags, one environment at a time: each flag's name, key, tags and an on / off switch, with its rollout and rules in a word ("25% · 2 rules"). A side panel edits the flag in that environment — on / off, the rollout percentage, targeting rules — and shows its history.

**The consumer provides** `<FeatureFlags flags environments attributes onChange onCreate>`: `flags` are `{ key, name, description?, tags?, environments: { [environmentId]: { enabled, rollout, rules } }, history? }` (a missing environment reads as off), `environments` are `{ id, name }`, `attributes` are what rules can target (`{ value, label }`: plan, country, e-mail…), and `defaultEnvironment`.

- `onChange(key, environment, state)` saves a flag's state in one environment: the switch calls it at once, the panel on **Save**. Without it the block is read only.
- `onCreate({ key, name, description })` adds **New flag**; the key follows the name (`flagKeyFromName`) until it's edited, and is checked.
- A rule is `{ id, attribute, operator, values, serve }`: "if Plan is one of pro, team → serve On". Operators are `in`, `not-in`, `contains` and `starts-with`. Rules are read in order and the first match decides; people no rule matches get the flag by `rollout` (0–100), in stable buckets so the same people keep it as it grows.
- `evaluateFeatureFlag(key, state, context)` (from feature-flag-rules) is that logic as a plain function, with the reason (`disabled`, `rule`, `rollout`); your server should give the same answer. `FeatureFlagRules` is the rule editor on its own.
- Each switch is named by the flag and the environment ("New checkout in Production"); focus goes back to the row's button when the panel closes, and to the next rule when one is removed.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/feature-flags`.
