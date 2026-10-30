# Accents

Cyan is Coreloom's accent. `accents.css` adds four presets — **blue**, **violet**, **amber**, **rose** — for products that need their own colour on the same system.

**Use** `@import "./coreloom/accents.css";` after the theme in `globals.css`, then `data-accent="violet"` on `<html>` (next to `data-theme`), or on any element to give one section its own accent.

- Each preset sets the whole accent family — fill, hover, press, text, subtle, ring, glow, text-on-accent — in both themes. Every pairing meets AA: text 4.5:1, fills and focus rings 3:1 on every surface. The colours live in `build/gen-accents.py`, which checks them and refuses to write a failing preset.
- Charts keep their palette. Status colours stay status colours: with amber or rose, the components already say the status in words.
- To let people choose, `AccentPicker` (from `@coreloom/theme-toggle`) shows one swatch per preset as a radio group, sets `data-accent` on `<html>` and keeps it in `localStorage("accent")`. Add the matching line to the anti-flash script (Getting started, step 8). `data-accent="cyan"` brings the default back inside a section with another preset.
- One accent per product. A section accent is for a clearly separate area (an admin zone, a sandbox), not decoration.

_See the Theming guide for a hand-made accent._
