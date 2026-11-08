# @coreloom/ai-evals

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-evals.tsx

```ts
function compareEvalRuns(baseline: Pick<EvalRun, 'cases'>, candidate: Pick<EvalRun, 'cases'>, { tolerance }?: { tolerance?: number; }) => EvalComparisonRow[]
type EvalCaseResult = {}
EvalCaseResult.id: string
EvalCaseResult.name: string
EvalCaseResult.input: string
EvalCaseResult.expected?: string | undefined
EvalCaseResult.output: string
EvalCaseResult.score: number
EvalCaseResult.passed: boolean
EvalCaseResult.scores?: Record<string, number> | undefined
EvalCaseResult.judge?: EvalJudgement | undefined
EvalCaseResult.latencyMs?: number | undefined
EvalCaseResult.cost?: number | undefined
EvalCaseResult.error?: string | undefined
EvalCaseResult.tags?: string[] | undefined
type EvalChange = 'regressed' | 'improved' | 'unchanged' | 'added' | 'removed'
type EvalComparisonRow = {}
EvalComparisonRow.id: string
EvalComparisonRow.name: string
EvalComparisonRow.baseline?: EvalCaseResult | undefined
EvalComparisonRow.candidate?: EvalCaseResult | undefined
EvalComparisonRow.change: EvalChange
EvalComparisonRow.delta?: number | undefined
type EvalFilter = 'failed' | 'regressed' | 'improved' | 'all'
type EvalJudgement = {}
EvalJudgement.verdict: EvalVerdict
EvalJudgement.reasoning?: string | undefined
EvalJudgement.judge?: string | undefined
type EvalRun = {}
EvalRun.id: string
EvalRun.label: string
EvalRun.model?: string | undefined
EvalRun.startedAt?: string | Date | undefined
EvalRun.cases: EvalCaseResult[]
function EvalRunReport
EvalRunReport.run: EvalRun
EvalRunReport.baseline?: EvalRun | undefined
EvalRunReport.tolerance?: number | undefined
EvalRunReport.defaultFilter?: EvalFilter | undefined
EvalRunReport.defaultSelectedId?: string | undefined
EvalRunReport.onRerunCase?: ((caseId: string) => void) | undefined
EvalRunReport.className?: string | undefined
type EvalSuite = {}
EvalSuite.id: string
EvalSuite.name: string
EvalSuite.description?: string | undefined
EvalSuite.caseCount: number
EvalSuite.threshold?: number | undefined
EvalSuite.lastRun?: {}
EvalSuite.lastRun.passRate: number
EvalSuite.lastRun.score?: number | undefined
EvalSuite.lastRun.at: string | Date
EvalSuite.history?: number[] | undefined
function EvalSuiteList
EvalSuiteList.suites: EvalSuite[]
EvalSuiteList.href?: ((id: string) => string) | undefined
EvalSuiteList.onRun?: ((id: string) => void) | undefined
EvalSuiteList.running?: readonly string[] | undefined
EvalSuiteList.className?: string | undefined
type EvalSummary = {}
EvalSummary.total: number
EvalSummary.passed: number
EvalSummary.failed: number
EvalSummary.errored: number
EvalSummary.passRate: number
EvalSummary.meanScore: number
EvalSummary.cost?: number | undefined
EvalSummary.latencyMs?: number | undefined
type EvalVerdict = 'error' | 'pass' | 'partial' | 'fail'
function EvalVerdictBadge
EvalVerdictBadge.verdict: EvalVerdict
function summarizeEvalRun(run: Pick<EvalRun, 'cases'>) => EvalSummary
```
