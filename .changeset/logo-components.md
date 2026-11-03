---
'@coreloom/ui': minor
---

### Added

- `Logo` (`@coreloom/logo`): your logo as an inline SVG or an image (with a light version), named for screen readers, optionally linked home, with entrance animations: `fade`, `stagger` (its groups one after the other), `draw` (outlines trace, then fill), `assemble`, `wipe`, `shine` and `pulse`, played on mount, in view or on hover. `logoParts` and `assembleOffset` are exported for your own effects.
- `LogoLoader` (`@coreloom/logo-loader`): the logo as a loading screen (busy status), that fades away into the content.
- `LogoCloud` (`@coreloom/logo-cloud`): customer or partner logos in a grid or a marquee, muted until hovered.

### Upgrading

- Re-add `@coreloom/theme` to get the logo keyframes and rules in `theme.css`.
