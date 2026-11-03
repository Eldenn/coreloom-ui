# Motion

Four durations and three easings: every transition in Coreloom UI uses one of each. The motion components (Reveal, text effects, Marquee, Spotlight, view transitions) are built on the same tokens.

**The tokens** live in `foundations.css` as `--dur-*` and in the theme's `theme.css` as `--duration-*`, with a Tailwind utility each (`duration-fast`, `duration-base`, `duration-slow`, `duration-reveal`; they also drive `transition-*` and tw-animate-css's enter / exit animations):

- `fast` 120ms: hover and press feedback, toggles, list highlights.
- `base` 180ms: color, border and focus-ring changes; the accordion.
- `slow` 320ms: overlays entering and leaving (dialogs, sheets, drawers) and page transitions.
- `reveal` 600ms: content arriving on scroll (`Reveal`, `Stagger`) and text effects only.
- `--ease-out` (`ease-out`) for things arriving (the default), `--ease-in-out` (`ease-in-out`) for things moving across the screen, `--ease-spring` for the `Switch` thumb only, the one playful motion the system allows.

Motion confirms what happened; it never carries information on its own. Keep enter animations short, exits shorter, and never animate layout the user is reading. Write `duration-base`, not `duration-180`: a token changes in one place.

**The motion components.** `Reveal` and `Stagger` bring content in as it scrolls into view; `WordReveal`, `Typewriter`, `ShimmerText` and `GradientText` animate text; `Marquee` scrolls logos or quotes; `Spotlight` and `BorderGlow` light a card; `useViewTransition` animates a change of view. They are for marketing pages, first-time screens and labels of work in progress, not for the screens people work in every day. One or two moving things per view.

**Loops.** Loops that carry state (the `Spinner`, a caret, `ShimmerText` on "Thinking…") may run while the state lasts. Decorative loops (`Marquee`, `BorderGlow`, an animated `GradientText`, a looping `Typewriter`) stop for reduced motion, and anything that moves for more than five seconds next to other content can be paused (the `Marquee` has a button).

**Reduced motion.** Under `prefers-reduced-motion: reduce`, `theme.css` makes every transition and enter / exit animation finish at once (1ms): overlays appear without sliding or zooming, the accordion opens without growing, the skeleton stops pulsing, revealed content and words are simply there, page transitions swap without animating, and the decorative loops stand still. The `Spinner` is the exception: it keeps turning, slower, because it carries state. `useReducedMotion()` (from `@coreloom/reveal`) reads the setting in your own code. Test it with your OS setting, or Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion".
