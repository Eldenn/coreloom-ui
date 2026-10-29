# Motion

Three durations and three easings: every transition in Coreloom UI uses one of each.

**The tokens** live in `foundations.css` (and Tailwind's `duration-*` / `ease-*` utilities in the components):

- `--dur-fast` 120ms — hover and press feedback, toggles, list highlights.
- `--dur-base` 180ms — color, border and focus-ring changes; the accordion.
- `--dur-slow` 320ms — overlays entering and leaving: dialogs, sheets, drawers.
- `--ease-out` for things arriving (the default), `--ease-in-out` for things moving across the screen, `--ease-spring` for the `Switch` thumb only — the one playful motion the system allows.

Motion confirms what happened; it never carries information on its own. Keep enter animations short, exits shorter, and never animate layout the user is reading.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, `theme.css` makes every transition and enter / exit animation finish at once (1ms): overlays appear without sliding or zooming, the accordion opens without growing, the skeleton stops pulsing. The `Spinner` is the exception — it keeps turning, slower, because it carries state. Test it with your OS setting, or Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion".
