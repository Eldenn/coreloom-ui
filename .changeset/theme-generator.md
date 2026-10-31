---
'@coreloom/ui': minor
---

### Added

- Theme generator: from one brand colour, `generateAccent(hex)` (`@coreloom/accent`) builds the
  whole accent family for both themes, checks every contrast pairing (adjusting lightness when a
  check fails) and writes a `brand.css` to import after `accents.css` (`data-accent="<name>"`).
  Try it on the Storybook page Foundations → Theme generator, or run
  `pnpm brand "#ff5a1f" --name orange > brand.css`.
