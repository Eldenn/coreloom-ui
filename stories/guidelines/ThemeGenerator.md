# Theme Generator

Makes your brand's accent from one colour: the whole accent family — fill, hover, press, text, text-on-accent, subtle, focus ring, border, glow — for the dark and the light theme, checked for contrast, as a `brand.css` that works like the presets in `accents.css`.

**Make it** on the _Foundations/Theme generator_ page in Storybook (pick the colour, name it, copy or download `brand.css`), or from the command line in this repo:

```bash
node build/gen-brand.mjs "#ff5a1f" --name orange > brand.css
```

- `--name` is the `data-accent` value (lowercase letters, digits and dashes; default `brand`).
- `--light-text dark` keeps the light-theme fill light and puts dark text on it, as Coreloom's cyan does; the default darkens the fill for white text.
- What was adjusted and every check go to stderr; the CSS goes to stdout. The command exits 1, and writes no CSS, when a check can't pass or the colour isn't hex (`#rgb` or `#rrggbb`).
- In code, `generateAccent(hex, { name, lightText })` from `src/lib/accent.ts` returns `{ dark, light, checks, adjustments, pass, css }`. It is pure TypeScript with no dependencies.

**Use it:** put `brand.css` next to the other Coreloom styles and import it after `accents.css` in `globals.css`:

```css
@import './coreloom/accents.css';
@import './brand.css';
```

Then set it on `<html>`, next to `data-theme` — `<html data-accent="orange">`, `<html data-accent="orange" data-theme="light">` — or on any element to give one section its own accent. Add the matching line to the anti-flash script (Getting started, step 8) if people can switch accents. To offer it in `AccentPicker`, add the name to `ACCENTS` in your copy of `theme-toggle.tsx` and its label to `theme.accents` in your i18n messages.

**What it guarantees** — the same checks `build/gen-accents.py` runs on the presets, against every surface of each theme (page, cards, inset, base):

- Text on the accent fill (and its hover and press states) reaches 4.5:1.
- The fill reaches 3:1 on every surface, so switches, sliders and selected tabs stay visible.
- Accent text (`text-primary-text`, links) reaches 4.5:1 on every surface and on the accent-subtle tint (default badges, selected rows).
- The focus ring reaches 3:1 on every surface.

**How it gets there:**

- Your colour is used as it is wherever it passes. Otherwise the generator moves its lightness (in OKLCH, so hue and chroma hold) one small step at a time until the check passes, and says what it moved and why. A typical brand colour is kept in dark and darkened in light.
- Hover, press and text start from fixed lightness steps off the fill, tuned so the five presets come back within a hair of their hand-picked values, then get the same nudging.
- Yellows lean towards amber when darkened for light (darkened yellow turns olive); greys stay grey.
- If something still fails, it says so — `pass` is false, the page shows the failing rows, the command exits 1. Don't ship a failing accent; pick a nearby colour.

- One accent per product. Status colours stay status colours: with a red or orange brand, components already say the status in words.
- Charts keep their palette.
- Contrast is checked against Coreloom's surfaces. If your app changes the surface colours, check again.

_See Accents for the presets and AccentPicker._
