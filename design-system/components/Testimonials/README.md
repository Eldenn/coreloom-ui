# Testimonials

Customer quotes as cards, in an even grid or a wall of columns with "Show more". Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/testimonials`. It writes `testimonials.tsx`.

**The consumer provides** `testimonials`: `{ id, quote, author, byline?, avatar?, logo?, rating?, source?, featured? }`. `TestimonialGrid` takes `columns` (2 or 3); `TestimonialWall` takes `initialCount` (9) and `columns` (2–4).

- A featured quote spans two columns in the grid. Ratings are read as "4.5 out of 5 stars".
- "Show more" reveals the rest and moves focus to the first new card.

_On `window.CoreloomUIDesignSystem_ff5f32` as `TestimonialGrid`, `TestimonialWall`, `TestimonialCard`._
