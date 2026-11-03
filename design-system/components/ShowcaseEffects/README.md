# Showcase effects

Effects for marketing pages and first-time screens: a moving backdrop, a card that tilts toward the pointer, a reading bar and layers that drift with the scroll, a word that decodes, images uncovered by a mask.

**The consumer provides:**

- `AnimatedBackground` (`@coreloom/animated-background`): `variant` (`grid`, `dots`, `aurora`), `size` (spacing in px, 32), `duration` (seconds per loop, 24), `animate` (true), `fade` (true, fades toward the edges). It fills its parent: give the parent `relative isolate`.
- `TiltCard` (`@coreloom/tilt-card`): the card's content and classes; `max` (degrees, 8) and `glare` (true). Only a mouse tilts it.
- `ScrollProgress` and `Parallax` (`@coreloom/scroll-effects`): the bar takes no props; a `Parallax` layer takes `distance` (px it travels while crossing the screen, 80; negative goes the other way). They use CSS scroll-driven animations: where the browser lacks them the bar is hidden and the layers stay put.
- `ScrambleText` (in `@coreloom/text-effects`): `text`, `duration` (900 ms), `trigger` (`in-view` or `mount`). Screen readers get the text once.
- Image reveals are `Reveal` effects (`@coreloom/reveal`): `wipe-up`, `wipe-down`, `wipe-left`, `wipe-right` and `circle`.

- All of them are decoration: they add no meaning, take no focus, and stand still for people who ask for reduced motion.
- One or two per page. Never behind text people need to read for long: keep the background faint (the default) and the text on a solid surface.
- `ScrollProgress` is hidden from screen readers: the scrollbar already says where you are.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add` `@coreloom/animated-background` `@coreloom/tilt-card` `@coreloom/scroll-effects` `@coreloom/text-effects` `@coreloom/reveal` and import from `@/components/ui/<item>`._
