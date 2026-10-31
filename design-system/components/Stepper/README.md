# Stepper

Where the user is in a multi-step flow: onboarding, checkout, an import wizard.

**The consumer provides** `steps` (`[{ title, description? }]`), `current` (0-based index; steps before it are done) and optionally `onStepChange` (finished steps become buttons that go back), `orientation` (`horizontal` default, `vertical`) and an `aria-label` (default "Progress").

- 32px circles: done steps fill `accent` with a check, the current one is `accent-subtle` with an `accent-fg` number and a soft ring, upcoming ones are `border-strong` outlines. The connector after a done step turns `accent`.
- It's a `nav` with an ordered list; the current step has `aria-current="step"`, and each step says "Step 2 of 4, current step" to screen readers.
- Three to five steps. Name steps by what they set up, not "Step 1". The onboarding block puts it above the step's card.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/stepper` and import from `@/components/ui/stepper`._
