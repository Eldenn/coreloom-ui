# Logo

Your logo, handled once for the whole app: in the header, on the sign-in page, as the loading screen, and the logos of your customers on the marketing site.

**The consumer provides:**

- `Logo` (`@coreloom/logo`): the logo as an inline SVG in `children` (best: it takes the text colour and animates part by part), or an image file in `src` with `srcLight` for light grounds. `label` (the brand's name, said by screen readers; with `href`, the link's name), `href` (links it, usually to `/`, through your router's link), `className` (its height, `h-8`: the width follows).
- Its animation: `animation` (`none`, `fade`, `stagger`, `draw`, `assemble`, `wipe`, `shine`, `pulse`), `trigger` (`mount`, `in-view`, `hover`, which replays on each hover and on focus of the link), `duration` (ms for the whole entrance: 900, 1800 for `draw`, 2400 per breath for `pulse`), `parts` (`auto`, `groups`, `shapes`) and `tint` (paints every shape in the text colour).
- `LogoLoader` (`@coreloom/logo-loader`): `loading`, `logo` (the same SVG), `label`, `animation` (`pulse`, or `draw`), `message` and `fullscreen`; the content to show once loading ends as `children`.
- `LogoCloud` (`@coreloom/logo-cloud`): `items` (`name`, `logo`, `href`), `layout` (`grid` or `marquee`), `columns` (3 to 6), `muted` (grey until hovered, `true`) and `label` (the list's name, "Our customers").

**Preparing the SVG.** Paste the file as a React component and replace the fixed colour by `fill="currentColor"` so the logo follows the theme (`text-foreground`, or the brand colour). For `stagger` and `assemble`, wrap each part of the logo in its own top-level `<g>` in the order it should arrive (symbol, then wordmark, then tagline): with several groups, the groups animate; with one or none, every shape does. Keep a brand's own colours on their shapes and leave `tint` off to keep them. Crop the `viewBox` to the drawing, so the height you give is the logo's height.

**Which animation.**

- `fade` or `wipe` for a header or a footer: short, calm.
- `stagger` or `assemble` for a hero or a sign-in page: once, on mount or in view.
- `draw` for a launch or a splash: the outlines trace themselves, then fill. Best on logos made of shapes, not on long text.
- `shine` for a hover on the header logo.
- `pulse` only while something loads (the `LogoLoader`).

- The logo is an image with a name (`role="img"`), or the link carries the name. Leave `label` out only when the name is written right beside it.
- An entrance plays once. Only `pulse` loops, and only while loading.
- For people who ask for reduced motion the logo is simply there, and the loader stands still.
- In a logo cloud, keep the logos the same height (`className` on each, or the default `h-8`) and give each a `name`: it is what screen readers say.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/logo @coreloom/logo-loader @coreloom/logo-cloud`, and import from `@/components/ui/<item>`.
