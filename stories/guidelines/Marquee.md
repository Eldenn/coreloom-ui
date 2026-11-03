# Marquee

A row or a column that scrolls by itself without end: customer logos, testimonials, integrations.

**The consumer provides**, for `Marquee`, the items as children. Optional: `direction` (`left` by default, `right`, `up`, `down`), `duration` (seconds per round, 30), `gap` (a CSS length, `2rem`), `pauseOnHover` (default `true`), `fade` (faded edges, default `true`), `controls` (the pause button, default `true`) and a controlled `paused` with `onPausedChange`.

- Moving content needs a way to stop it (WCAG 2.2.2): keep the pause button unless the page pauses it another way. It is named "Pause the animation" / "Play the animation" and is a toggle (`aria-pressed`).
- It stops while the pointer is over the items or focus is inside, so a link in an item can be read and clicked.
- The items are drawn twice to close the loop; the second copy is hidden from screen readers and from Tab.
- For people who ask for reduced motion it stands still and the button is hidden.
- Give a vertical marquee a height. Don't put information people need in it: a marquee is for social proof, not content.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/marquee` and import from `@/components/ui/marquee`.
