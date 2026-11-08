# @coreloom/feature-flags

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/feature-flags.tsx

```ts
type FeatureFlag = {}
FeatureFlag.key: string
FeatureFlag.name: string
FeatureFlag.description?: string | undefined
FeatureFlag.tags?: string[] | undefined
FeatureFlag.environments: Partial<Record<string, FeatureFlagState>>
FeatureFlag.history?: FeatureFlagChange[] | undefined
type FeatureFlagChange = {}
FeatureFlagChange.id: string
FeatureFlagChange.at: Date
FeatureFlagChange.author?: string | undefined
FeatureFlagChange.environment?: string | undefined
FeatureFlagChange.text: string
type FeatureFlagEnvironment = {}
FeatureFlagEnvironment.id: string
FeatureFlagEnvironment.name: string
type FeatureFlagInput = {}
FeatureFlagInput.key: string
FeatureFlagInput.name: string
FeatureFlagInput.description: string
function FeatureFlags
FeatureFlags.flags: FeatureFlag[]
FeatureFlags.environments: FeatureFlagEnvironment[]
FeatureFlags.attributes?: FeatureFlagAttribute[] | undefined
FeatureFlags.defaultEnvironment?: string | undefined
FeatureFlags.onChange?: ((key: string, environment: string, state: FeatureFlagState) => unknown) | undefined
FeatureFlags.onCreate?: ((input: FeatureFlagInput) => unknown) | undefined
FeatureFlags.className?: string | undefined
function flagKeyFromName(name: string) => string
```

## src/components/feature-flag-rules.tsx

```ts
function evaluateFeatureFlag(flagKey: string, state: FeatureFlagState, context: Readonly<Record<string, string | undefined>>) => FeatureFlagEvaluation
type FeatureFlagAttribute = {}
FeatureFlagAttribute.value: string
FeatureFlagAttribute.label: string
type FeatureFlagEvaluation = { value: false; reason: 'disabled'; } | { value: boolean; reason: 'rule'; ruleId: string; } | { value: boolean; reason: 'rollout'; bucket: number; }
type FeatureFlagOperator = 'contains' | 'in' | 'not-in' | 'starts-with'
type FeatureFlagRule = {}
FeatureFlagRule.id: string
FeatureFlagRule.attribute: string
FeatureFlagRule.operator: 'contains' | 'in' | 'not-in' | 'starts-with'
FeatureFlagRule.values: string[]
FeatureFlagRule.serve: boolean
function FeatureFlagRules
FeatureFlagRules.rules: FeatureFlagRule[]
FeatureFlagRules.attributes: FeatureFlagAttribute[]
FeatureFlagRules.disabled?: boolean | undefined
FeatureFlagRules.onChange: (rules: FeatureFlagRule[]) => void
type FeatureFlagState = {}
FeatureFlagState.enabled: boolean
FeatureFlagState.rollout: number
FeatureFlagState.rules: FeatureFlagRule[]
const FLAG_OPERATORS: readonly ['in', 'not-in', 'contains', 'starts-with']
function rolloutBucket(flagKey: string, id: string) => number
```
