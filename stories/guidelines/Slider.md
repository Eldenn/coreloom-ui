# Slider

Pick a number, or a range, by dragging or with the keyboard.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`) as an **array** — one number for a single thumb, two for a range — plus `min`, `max`, `step`, and an `aria-label` or visible label. Show the current value next to the label yourself.

- 4px `surface-hover` track with a `border` inset hairline, `accent` range, 18px `accent` thumbs ringed in `bg-1` inside a 24px target (WCAG 2.5.8); hover adds an `accent-subtle` halo, focus `--ring-focus`.
- The `aria-label` names the thumb; a range's thumbs get "…, minimum" and "…, maximum". Or pass `aria-labelledby` with the visible label's id.
- Arrows move one step, Page Up / Down ten, Home / End to the ends (Radix).
- Use when the feel matters more than the exact number; for precise values, pair it with an `Input`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/slider` and import from `@/components/ui/slider`.
