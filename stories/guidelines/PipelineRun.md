# PipelineRun

One run of a CI pipeline or a deploy, as GitHub Actions or GitLab show it: the run's status and duration, its jobs, each job's steps, and each step's log. Use it for a build page, a deploy's progress, a scheduled job's history.

**The consumer provides** `title`, `status` and `jobs` (`{ id, name, status, durationMs?, steps: [{ id, name, status, durationMs?, log? }] }`, the log as text with ANSI colours or as LogViewer entries), and optionally `meta` (branch, commit, author), `durationMs`, `onRerun`, `onCancel`, `onRerunJob(job)`, `defaultJob`, `logHeight` (300), `timeZone` and `actions`. Statuses: `queued`, `running`, `success`, `failed`, `cancelled`, `skipped`.

- The run opens on its failed job (else the running one), with the failed (or running) step open. Each step opens and closes on its own; a running step's log follows its end.
- Cancel shows while the run is queued or running, Re-run once it isn't; Re-run job on a finished job. They are callbacks: update `status` and `jobs` as your API reports progress.
- Every status has an icon and a word (for screen readers, and as a tooltip), never colour alone.
- Logs are LogViewers: search, levels, wrap and copy per step.
- Below 672 px of its own width, the jobs move above the steps and scroll sideways.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/pipeline-run` and import from `@/components/pipeline-run`.
