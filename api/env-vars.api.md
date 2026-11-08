# @coreloom/env-vars

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/env-vars.tsx

```ts
function compareEnvironments(variables: readonly EnvVariable[], environments: readonly string[]) => { key: string; status: EnvComparison; missing: string[]; }[]
type EnvComparison = 'same' | 'different' | 'missing'
type EnvEnvironment = {}
EnvEnvironment.id: string
EnvEnvironment.name: string
type EnvVariable = {}
EnvVariable.key: string
EnvVariable.values: Partial<Record<string, string>>
EnvVariable.secret?: boolean | undefined
type EnvVariableInput = {}
EnvVariableInput.key: string
EnvVariableInput.value: string
EnvVariableInput.secret: boolean
EnvVariableInput.environments: string[]
function EnvVars
EnvVars.environments: EnvEnvironment[]
EnvVars.variables: EnvVariable[]
EnvVars.defaultEnvironment?: string | undefined
EnvVars.onSet?: ((input: EnvVariableInput) => unknown) | undefined
EnvVars.onDelete?: ((key: string, environment: string) => unknown) | undefined
EnvVars.onImport?: ((environment: string, entries: DotenvEntry[]) => unknown) | undefined
EnvVars.title?: React.ReactNode
EnvVars.description?: React.ReactNode
EnvVars.className?: string | undefined
```
