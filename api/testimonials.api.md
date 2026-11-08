# @coreloom/testimonials

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/testimonials.tsx

```ts
type Testimonial = {}
Testimonial.id: string
Testimonial.quote: React.ReactNode
Testimonial.author: string
Testimonial.byline?: React.ReactNode
Testimonial.avatar?: React.ReactNode
Testimonial.logo?: React.ReactNode
Testimonial.rating?: number | undefined
Testimonial.source?: {}
Testimonial.source.label: string
Testimonial.source.href?: string | undefined
Testimonial.featured?: boolean | undefined
function TestimonialCard
TestimonialCard.testimonial: Testimonial
TestimonialCard.*: react
function TestimonialGrid
TestimonialGrid.testimonials: Testimonial[]
TestimonialGrid.columns?: 2 | 3 | undefined
TestimonialGrid.className?: string | undefined
TestimonialGrid.aria-label?: string | undefined
function TestimonialWall
TestimonialWall.testimonials: Testimonial[]
TestimonialWall.initialCount?: number | undefined
TestimonialWall.columns?: 2 | 4 | 3 | undefined
TestimonialWall.className?: string | undefined
TestimonialWall.aria-label?: string | undefined
```
