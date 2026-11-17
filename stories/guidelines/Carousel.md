# Carousel

Swipeable slides with previous / next buttons, built on Embla.

**The consumer provides** `<Carousel opts orientation setApi>` holding `<CarouselContent>` with `<CarouselItem>`s, plus `<CarouselPrevious />` and `<CarouselNext />`. Size slides with `className="basis-1/2"` on items. `opts` are Embla's (`align`, `loop`…) and `plugins` its plugins (autoplay, wheel gestures). `setApi` gives you the Embla API for dots or a counter.

- The buttons are 36px round `outline` buttons on `surface-1`, outside the track. They disable at the ends unless `loop` is set.
- Swipe, drag, and Arrow Left / Right when the carousel has focus (Arrow Up / Down when `orientation="vertical"`). A text field, a select, radios or a slider inside a slide keep their arrow keys.
- The region is announced as a carousel and each slide as a slide, in the current language. It is named "Carousel" by default: pass `aria-label` (or `aria-labelledby`) to say what it holds, and always when a page has several.
- Use it for content people browse, like screenshots or testimonials, with the next slide partly visible. Don't hide anything essential in it, and don't autoplay.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/carousel` and import from `@/components/ui/carousel`.
