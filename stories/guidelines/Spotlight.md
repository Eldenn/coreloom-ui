# Spotlight

Two quiet effects for a card you want to stand out: `Spotlight`, a soft light that follows the pointer, and `BorderGlow`, a light that runs along the border.

**The consumer provides**, for `Spotlight`, the content and the card's own classes (border, background, padding, radius). Optional: `size` (diameter of the light in px, 360). `BorderGlow` takes the content (it gets the card background) and the radius as a class. Optional: `duration` (seconds per round, 6) and `width` (border width in px, 1).

- Both are decoration: they add no meaning and take no focus. Never use them to show state (selected, error).
- The spotlight only shows under a pointer; on touch the card simply looks like a card.
- `BorderGlow` stands still for people who ask for reduced motion.
- Use one or two per view, on the thing you recommend (a plan, a feature).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/spotlight` and import from `@/components/ui/spotlight`.
