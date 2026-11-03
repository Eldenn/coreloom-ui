---
'@coreloom/ui': minor
---

### Added

- `StatusButton` (`@coreloom/status-button`): a button that shows its action, with a spinner,
  a drawn check on success and a shake on error, each announced.
- `DrawIcon`, `MorphIcon` and `MenuToggleIcon` (`@coreloom/animated-icon`): icons that draw
  themselves, turn into one another, or fold into a cross.
- `AnimatedList` (`@coreloom/animated-list`), `AnimatedHeight` (`@coreloom/animated-height`)
  and `TabsIndicator` (`@coreloom/tabs-indicator`): items that slide in and out, a box that
  follows its content's height, a highlight that slides between tabs.
- `Ping` and `PingDot` (`@coreloom/ping`), `fireConfetti` (`@coreloom/confetti`),
  `PageProgress` (`@coreloom/page-progress`) and `TypingIndicator`
  (`@coreloom/typing-indicator`).
- `AnimatedBackground` (`@coreloom/animated-background`), `TiltCard` (`@coreloom/tilt-card`),
  `ScrollProgress` and `Parallax` (`@coreloom/scroll-effects`, CSS scroll-driven), and
  `ScrambleText` in `@coreloom/text-effects`.
- `Reveal` and `Stagger` take mask effects for images: `wipe-up`, `wipe-down`, `wipe-left`,
  `wipe-right` and `circle`.

### Upgrading

- Add the theme again (`pnpm dlx shadcn@latest add @coreloom/theme`): the new keyframes and the
  TabsIndicator rules live in `theme.css`.
