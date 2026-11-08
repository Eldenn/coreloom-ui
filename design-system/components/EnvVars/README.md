# Environment variables

A project's environment variables per environment: masked secrets, Add, Edit, Delete, Import a pasted `.env`, Compare.

**Install** `pnpm dlx shadcn@latest add @coreloom/env-vars`. Experimental.

**The consumer provides** `environments`, `variables` (`{ key, values: { [environmentId]: value }, secret? }`) and `onSet`, `onDelete(key, environment)`, `onImport(environment, entries)`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `EnvVars`._
