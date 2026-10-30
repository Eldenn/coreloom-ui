# Accents

Cyan is Coreloom's accent. `accents.css` adds four presets — **blue**, **violet**, **amber**, **rose** — for products that need their own colour on the same system.

**Use** `@import "./coreloom/accents.css";` after the theme in `globals.css`, then `data-accent="violet"` on `<html>` (next to `data-theme`), or on any element to give one section its own accent.

- Each preset sets the whole accent family — fill, hover, press, text, subtle, ring, glow, text-on-accent — in both themes. Every pairing meets AA: text 4.5:1, fills and focus rings 3:1 on every surface. The colours live in `build/gen-accents.py`, which checks them and refuses to write a failing preset.
- Charts keep their palette. Status colours stay status colours: with amber or rose, the components already say the status in words.
- One accent per product. A section accent is for a clearly separate area (an admin zone, a sandbox), not decoration.

_See the Theming guide for a hand-made accent._
