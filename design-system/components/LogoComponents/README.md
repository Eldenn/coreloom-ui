# Logo components

Your logo, handled once: inline SVG or image file (dark and light versions), a name for screen readers, an optional link home, and entrance animations.

**The consumer provides**, for `Logo`, the inline SVG as children (with `fill="currentColor"`) or `src` / `srcLight`, a `label` and a height in `className`. Optional: `href`, `animation` (`fade`, `stagger`, `draw`, `assemble`, `wipe`, `shine`, `pulse`), `trigger` (`mount`, `in-view`, `hover`), `duration`, `parts` and `tint`. `LogoLoader` takes `loading`, `logo`, `label`, `message` and `fullscreen`; `LogoCloud` takes `items` (`name`, `logo`, `href`) and `layout` (`grid` or `marquee`).

- Wrap each part of the SVG (symbol, wordmark, tagline) in a top-level `<g>`: `stagger` and `assemble` bring them in one after the other.
- `draw` traces the outlines then fills: for a splash or a launch, not for every page.
- Only `pulse` loops, and only while loading. Under reduced motion the logo is simply there.
- The logo is an image with a name, or its link carries the name.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/logo` (and `@coreloom/logo-loader`, `@coreloom/logo-cloud`) and import from `@/components/ui/<item>`._
