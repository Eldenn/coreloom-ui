# AgentPlan

The steps an agent works through, ticked off as it goes: to do, in progress, done, failed or skipped, with "2 of 5 done" and a bar.

The plan travels as an AI SDK data part: the stream writes `{ type: 'data-plan', id, data: { title?, steps } }` and writes it again with the same `id` as steps move, so the message holds one plan that changes. `Chat` draws these parts by itself.

**The consumer provides** `plan` (`{ title?, steps: [{ id, title, status, detail? }] }`; read untrusted data with `readPlan`), plus optionally `active` (default `true`: a running step spins; when false it shows as stopped), `announce` (its own polite live region; off inside Chat's log), `label` and `defaultOpen`.

- The steps are an ordered list named after the plan; the step in progress has `aria-current="step"` and every status is written out for screen readers.
- Failure reasons and results go in `detail`, under the step.
- For a fixed sequence the person goes through, use Stepper; a plan is what an agent decided to do.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/agent-plan` and import from `@/components/ui/agent-plan`.
