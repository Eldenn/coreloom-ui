# Onboarding

A multi-step setup screen: the `Stepper` on top, the current step in a card, Back / Continue at the bottom (Finish on the last step).

**Install** `pnpm dlx shadcn@latest add @coreloom/onboarding`. It writes `onboarding.tsx` (and installs `Stepper`).

**The consumer provides** `<OnboardingLayout steps current title description brand onBack onNext>` around the step's content, and optionally `onStepChange` (jump back from the stepper), `onSkip` ("Skip for now"), `nextLabel`, `pending`, and `nextType="submit"` + `formId` to make Continue submit the step's `<form id>`.

- When the step changes, focus moves to the new step's title, so keyboard and screen-reader users land on it. Continue shows a spinner while `pending`.
- Keep one form per wizard and validate only the step on screen (one schema per step); the Storybook "Setup wizard" story does this with `useAppForm`.
- Three to five steps; put optional ones last and offer Skip.
