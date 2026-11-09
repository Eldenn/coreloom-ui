# Feature flags

Feature flags per environment: on / off, rollout percentage, targeting rules (first match wins), history.

**Install** `pnpm dlx shadcn@latest add @coreloom/feature-flags`. Experimental.

**The consumer provides** `flags` (`{ key, name, environments: { [id]: { enabled, rollout, rules } } }`), `environments`, `attributes`, `onChange(key, environment, state)` and `onCreate`. `evaluateFeatureFlag` is the logic your server applies.

_On `window.CoreloomUIDesignSystem_ff5f32` as `FeatureFlags`._
