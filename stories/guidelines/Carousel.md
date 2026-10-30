# Carousel

Swipeable slides with previous / next buttons, built on Embla.

**The consumer provides** `<Carousel opts orientation setApi>` holding `<CarouselContent>` with `<CarouselItem>`s, plus `<CarouselPrevious />` and `<CarouselNext />`. Size slides with `className="basis-1/2"` on items. `opts` are Embla's (`align`, `loop`…). `setApi` gives you the Embla API for dots or a counter.

- The buttons are 36px round `outline` buttons on `surface-1`, outside the track. They disable at the ends unless `loop` is set.
- Swipe, drag, and Arrow Left / Right when the carousel has focus. The region is labelled as a carousel and each slide as a slide.
- Use it for content people browse, like screenshots or testimonials, with the next slide partly visible. Don't hide anything essential in it, and don't autoplay.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/carousel` and import from `@/components/ui/carousel`.
