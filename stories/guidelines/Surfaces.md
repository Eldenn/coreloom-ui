# Surfaces

Graphite is Coreloom's surface. `surfaces.css` adds two presets — **mineral** (a cold, desaturated blue) and **bone** (warm off-whites) — for sites that need their own backgrounds on the same system.

**Use** `@import "./coreloom/surfaces.css";` after the theme (and `accents.css`) in `globals.css`, then `data-surface="bone"` on `<html>`, next to `data-theme`.

- Each preset sets every background (`bg-base`, `bg-1`, `surface-1`, `surface-2`, `surface-hover`, `surface-inset`), border and text grey, in both themes. Every pairing meets AA on all of the preset's surfaces, with every accent preset: text 4.5:1, borders of controls, fills and focus rings 3:1. The colours live in `build/gen-surfaces.py`, which checks them and refuses to write a failing preset.
- A band of the page with other surfaces: `data-surface` on the element, plus `bg-background` so it paints. When the band also changes theme, put both on the same element — `<section data-theme="dark" data-surface="mineral" class="bg-background">` — and `data-accent` too if the site uses one.
- Your own surfaces: copy a preset block under a new name and change the hex values, then check them with the script (add the preset to `P`). Keep the steps between layers small: the layers read as depth, not as colour.
- Status and chart colours don't change, except where a preset needs a darker one to keep 4.5:1 (bone's warning text).
