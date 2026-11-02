# AI Evaluations

How good a prompt, a model or an agent is, case by case: `EvalSuiteList`, your test suites with their last pass rate, the trend and a Run button; and `EvalRunReport`, one run's cases with their scores and the judge's verdict, or two runs side by side to catch regressions before shipping. It complements AI runs: a trace shows what one run did, an eval scores many answers against what was expected.

**`EvalSuiteList` takes** `suites` (`{ id, name, description?, caseCount, threshold?, lastRun?: { passRate, score?, at }, history? }`, rates from 0 to 1) and optionally `href(id)`, `onRun(id)` and `running` (ids whose button is busy). **`EvalRunReport` takes** `run` (`{ id, label, model?, startedAt?, cases }`, each case `{ id, name, input, expected?, output, score, passed, scores?, judge?: { verdict, reasoning?, judge? }, latencyMs?, cost?, error?, tags? }`) and optionally `baseline` (an earlier run), `tolerance` (default 0.05), `defaultFilter`, `defaultSelectedId` and `onRerunCase(id)`.

- With a `baseline`, a case **regressed** when it passed and now fails, or its score dropped by more than `tolerance`; **improved** the other way round. The report opens on the regressions, the totals show the change in points, and each case's outputs show in a split diff (DiffViewer).
- Cases match across runs by `id`: keep ids stable. Cases only in one run show as **New case** or **Removed**.
- A case with an `error` (timeout, crash in the grader) counts as failed and shows the error; `onRerunCase` adds Run again.
- Verdicts and changes always have a word, never colour alone; scores follow the locale's percent format. The case list is buttons that say which one is selected.
- `summarizeEvalRun(run)` and `compareEvalRuns(baseline, run, { tolerance })` are exported for your own views (a CI comment, a chart).
- Map your eval tool's output (promptfoo, Braintrust, LangSmith, OpenAI evals, your own script) to `EvalRun`; nothing is fetched or run here.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-evals`.
