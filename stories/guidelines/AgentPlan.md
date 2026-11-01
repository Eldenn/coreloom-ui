# Agent Plan

The steps an agent works through, ticked off as it goes: to do, in progress, done, failed or skipped, with "2 of 5 done" and a bar. People see what the agent is about to do before it does it, and where it is while it works.

The plan travels as an AI SDK data part. Whatever streams the conversation writes a `data-plan` part with an `id`, and writes it again with the same `id` each time a step moves: the SDK replaces the part in place, so the message holds one plan that changes.

```ts
// The part, as it arrives in `message.parts`
{ type: 'data-plan', id: 'plan', data: { title: 'Fix the failing deploys', steps: [
  { id: '1', title: 'Read the build logs', status: 'done', detail: 'All three fail on TS2339.' },
  { id: '2', title: 'Rename slug to handle', status: 'running' },
  { id: '3', title: 'Open a pull request', status: 'pending' },
] } }
```

**The consumer provides** nothing in `Chat`: it draws `data-plan` parts by itself, spinning while the reply streams. Use `renderData` to draw them your own way. On its own, `AgentPlan` takes:

- `plan` — `{ title?, steps: [{ id, title, status, detail? }] }`, with `status` one of `pending`, `running`, `done`, `failed`, `skipped`. Data from a model is untrusted: read it with `readPlan(value)` from `@/lib/ai`, which drops steps without a title, maps other agents' statuses (`in_progress`, `completed`, `cancelled`) and returns `undefined` for anything that isn't a plan;
- `active` (default `true`) — the agent is still working. When it isn't (stopped, failed, finished), a step left in progress shows as stopped instead of spinning;
- `announce` (default `false`) — reads out the step in progress, then "Plan complete" or the step that failed, through its own polite live region. Leave it off inside another live region, such as `Chat`'s log, which reads the changes already;
- `label` (defaults to the plan's `title`, then "Plan") and `defaultOpen` (default `true`).

- The header is a disclosure button with the count; the steps are an ordered list named after the plan, and the step in progress has `aria-current="step"`.
- Each step's status is written out for screen readers ("Run the type check (In progress)"); icons and colour only repeat it.
- `planProgress(plan)` gives the same numbers for your own UI: `finished`, `total`, `current`, `failed`, `complete`.
- Keep step titles short and concrete, in the words of the person's task. Put results and failure reasons in `detail`, not in the title.
- Don't use it for a fixed, known sequence the person goes through (onboarding, checkout): that is a Stepper. A plan is what an agent decided to do.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/agent-plan` (it comes with `@coreloom/ai-chat`) and import from `@/components/ui/agent-plan`.
