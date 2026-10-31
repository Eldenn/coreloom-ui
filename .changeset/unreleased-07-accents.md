---
'@coreloom/ui': minor
---

### Added

- `AccentPicker` and `useAccent()` in `@coreloom/theme-toggle`: one swatch per preset, a radio
  group, saved in `localStorage("accent")`. `accents.css` gains a `cyan` preset that brings the
  default back inside an element with another accent.

### Changed

- Light theme: `accent` `#009f96` → `#00968d` and `accent-fg` `#007270` → `#006f6c`. The accent
  fill was 2.9:1 on `surface-inset`, under the 3:1 non-text minimum; it is now 3.1:1 or more on
  every surface. The change is barely visible.

### Upgrading

- Re-install `@coreloom/theme` with `--overwrite` for the new light accent and the `cyan` preset,
  then run the **Visual baselines** workflow if you keep screenshots of your own.
