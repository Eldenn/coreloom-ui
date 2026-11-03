---
'@coreloom/ui': minor
---

### Added

- Motion tokens in the theme: `--duration-fast` / `-base` / `-slow` / `-reveal` (120, 180, 320 and
  600 ms) with the `duration-fast`, `duration-base`, `duration-slow` and `duration-reveal`
  utilities, and `--ease-in-out` next to `--ease-out` and `--ease-spring`.
- `Reveal` and `Stagger` (`@coreloom/reveal`): content that fades, slides, scales or comes into
  focus as it scrolls into view, once, item by item for `Stagger`; `useInView` and
  `useReducedMotion` are exported.
- `WordReveal`, `Typewriter`, `ShimmerText` and `GradientText` (`@coreloom/text-effects`): words
  arriving one by one, typed phrases with a caret, a shimmer for "Thinking…" labels, the accent
  gradient on text. Screen readers get the whole text once.
- `Marquee` (`@coreloom/marquee`): logos or quotes scrolling without end, with faded edges, a
  pause button, and a stop on hover and focus.
- `Spotlight` and `BorderGlow` (`@coreloom/spotlight`): a light that follows the pointer across a
  card, and a light running along its border.
- `useViewTransition` and `startViewTransition` (`@coreloom/view-transition`): fade, slide,
  slide-back or scale between views with the View Transitions API.
- Everything stands still for people who ask for reduced motion, page transitions included.

### Changed

- Components use the duration utilities instead of fixed values (`duration-base` for
  `duration-180`, and so on); nothing moves differently.

### Upgrading

- Add the theme again (`pnpm dlx shadcn@latest add @coreloom/theme`): the duration utilities and
  the keyframes of the new components live in `theme.css`, and updated components need them.
