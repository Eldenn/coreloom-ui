# View transition

Animates a change of view (a route, a tab, a step of a wizard) with the browser's View Transitions API: the old view fades, slides or scales out while the new one comes in.

**The consumer provides** the state update that changes the view: `useViewTransition()` returns a function to call with it and, optionally, `{ effect }` (`fade` by default, `slide`, `slide-back`, `scale`). It returns a promise that settles when the transition ends. `startViewTransition(update, options)` is the same outside React. The effects are CSS in `theme.css` (they key off `data-view-transition` on `<html>`).

- Where the API is missing, or for people who ask for reduced motion, the update simply runs: nothing depends on the animation.
- Use `slide` going forward and `slide-back` going back, so the direction matches the order of the steps.
- Give an element the same CSS `view-transition-name` in both views to have it move from one place to the other (a thumbnail that becomes the header image). Names must be unique on the page.
- Move focus and announce the new view as you would without the transition: the animation changes neither.
- With TanStack Router, use its own `viewTransition` option on links and `navigate`; the effects here apply to it too.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/view-transition` and import from `@/components/ui/view-transition`._
