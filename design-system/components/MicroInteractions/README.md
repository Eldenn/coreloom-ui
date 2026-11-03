# Micro-interactions

Small motions inside the screens people work in: a button that shows what its action is doing, icons that confirm, lists, tabs and boxes that move instead of jumping.

**The consumer provides:**

- `StatusButton` (`@coreloom/status-button`) takes a `status`: `idle` (the label), `loading` (a spinner, `aria-busy`, clicks ignored but focus kept), `success` (a check that draws itself and `successLabel`, "Done" by default) or `error` (a short shake and an X, the label stays). `loadingLabel` and `errorLabel` are optional; every change is announced in a polite live region next to the button. It takes every `Button` prop. The consumer owns the state and returns it to `idle`.
- `DrawIcon` (`@coreloom/animated-icon`): `icon` (`check`, `cross`, `arrow`, `circle-check`), `duration` per stroke (420 ms), `delay`, and `label` when it is the only sign of the state (otherwise it is decorative). `MorphIcon`: `active`, `from` and `to` icons; put the name of the current state on the button around it. `MenuToggleIcon`: `open`; put `aria-expanded` on its button.
- `AnimatedList` (`@coreloom/animated-list`): keyed children; `as` (`ul`, `ol`, `div`), `itemClassName`, `exitDuration` (180 ms), `animateOnMount` (false). Removed items stay for their exit, hidden from screen readers and from Tab.
- `TabsIndicator` (`@coreloom/tabs-indicator`): put it last inside a `TabsList`, with `variant` `pill` (default) or `line` to match the list. While it is there, the active tab lends it its background or underline; forced-colors mode keeps the tab's own styles.
- `AnimatedHeight` (`@coreloom/animated-height`): any content; it animates to the content's height on the `duration-slow` token.

- Motion here confirms what happened; the state is always in text too (the button label, the announcement, `aria-expanded`).
- Keep them quick: they use `duration-base` and `duration-slow`, never `duration-reveal`.
- For people who ask for reduced motion every change happens at once; nothing is lost.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add` `@coreloom/status-button` `@coreloom/animated-icon` `@coreloom/animated-list` `@coreloom/tabs-indicator` `@coreloom/animated-height` and import from `@/components/ui/<item>`._
