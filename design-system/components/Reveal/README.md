# Reveal

Content that arrives as it scrolls into view: a fade, a short slide, a scale or a blur, once. `Stagger` does the same for a list or a grid, one item after the other.

**The consumer provides**, for `Reveal`, the content as children. Optional: `effect` (`up` by default, `fade`, `down`, `left` comes in from the right, `right`, `scale`, `blur`), `delay` in ms, and the observer's `once` (default `true`), `threshold` (default `0.15`) and `rootMargin`. `Stagger` takes the items as children, the same `effect` and observer options, `step` (ms between items, default 70), `delay` and `itemClassName` for the element around each item. `useInView(ref, options)` and `useReducedMotion()` are exported for your own effects.

- It plays once, on the `duration-reveal` token (600 ms) with `ease-out`; past the tenth item `Stagger` stops adding delay, so a long list doesn't make people wait.
- For people who ask for reduced motion the content is simply there: no slide, no fade.
- Hidden content is only transparent: screen readers and find-in-page still reach it.
- Use it for marketing pages and first-time screens, a few sections per page. Don't reveal content people work in every day (tables, forms, dashboards): it slows them down.
- `Stagger` wraps each item in a `div`: give grid or flex sizing to `itemClassName` when the items need it.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/reveal` and import from `@/components/ui/reveal`._
