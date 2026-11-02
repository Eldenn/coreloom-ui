# Aspect Ratio

Keeps a box at a width-to-height ratio whatever its width: images, videos, maps, previews. It is Radix's AspectRatio, as in shadcn.

**The consumer provides** `ratio` (a number: `16 / 9`, `1`, `4 / 3`; default `1`) and the content, which fills the box — give an image `className="size-full object-cover"` and an `alt`.

- Reserving the space before the media loads keeps the page from jumping.
- It sets no corners or background: round the content (`rounded-md`) or wrap it in a `Card`.
- For a box that should grow with its content, don't use a fixed ratio.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/aspect-ratio` and import from `@/components/ui/aspect-ratio`.
