# AI Evaluations

`EvalSuiteList`: test suites with their last pass rate against a threshold, the trend and Run. `EvalRunReport`: one run case by case (score, judge's verdict and reasoning, metrics, input, expected, output), or two runs side by side with `baseline`: deltas, regressions and improvements, and the outputs in a split diff.

**The consumer provides** `suites` (`{ id, name, caseCount, threshold?, lastRun?, history? }`) and `onRun(id)`; `run` and optionally `baseline` (`{ id, label, cases }`, each case `{ id, name, input, expected?, output, score, passed, scores?, judge?, error? }`), `onRerunCase(id)`.

- A case regressed when it passed and now fails, or its score dropped by more than `tolerance` (0.05). Cases match by `id`.
- `summarizeEvalRun` and `compareEvalRuns` are exported. Nothing is fetched or run.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-evals`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `EvalSuiteList` and `EvalRunReport`._
