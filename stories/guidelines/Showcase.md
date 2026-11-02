# Showcase site

Sections for the public site of a business people visit: a practice, a studio, a firm. A hero with a photo, the people, how to come and when, a few words from clients, and the legal pages.

**Install** `pnpm dlx shadcn@latest add @coreloom/showcase`. It writes `hero.tsx`, `practitioner-card.tsx`, `contact-section.tsx`, `media-section.tsx`, `quote.tsx` and `legal-layout.tsx`, plus `site-header.tsx` and `site-footer.tsx`.

**The consumer provides**:

- `<Hero layout media eyebrow title highlight description actions>`. `layout="split"` puts `media` (an `<img>` with its `alt`) beside the text from 1024px, `mediaPosition="start"` flips it; `layout="cover"` fills the section with it behind a scrim, in the dark theme. `highlightStyle="solid"` sets the highlight in plain accent text instead of the gradient. The default `"centered"` layout is the marketing hero.
- `<PractitionerCard name profession photo specialties bio facts actions orientation headingLevel>` inside `<PractitionerGrid eyebrow title description columns>`. `photo` is an `<img alt="">` (the name is beside it); without one the initials show. `facts` are `{ icon?, label, value }`: languages, approvals, a registration number.
- `<ContactSection eyebrow title description map>` around `<ContactDetails address directionsHref phone email items>` and `<OpeningHours hours exceptions now weekStartsOn showStatus>`. `hours` is `{ monday: [{ open: "09:00", close: "12:30" }, …], … }`; a missing day is closed. `exceptions` are `{ date: "YYYY-MM-DD", label?, hours? }` (no `hours`: closed that day).
- `<MediaSection eyebrow title media mediaPosition mediaAspect actions>` with the body as children.
- `<Quote author byline avatar cite variant align>` with the words as children: `variant="large"` for a section of its own, `"card"` for a row of testimonials.
- `<LegalLayout title updated intro sections numbered>`, sections `{ id, title, content }`.
- `<SiteFooter brand columns social note links>`: columns are `{ title, links?, content? }`.

- `OpeningHours` marks today, says "Open now · Closes at 12:30" or "Opens tomorrow at 9:00", and formats days and times for the locale. It reads the visitor's clock after hydration (pass `now` to render it on the server or in tests): times are the place's wall-clock times, right for visitors in the same time zone. Ranges over midnight aren't supported.
- The phone link dials the digits of `phone` as written; the directions link must be `https://` and opens in a new tab. An embedded map loads a third-party site: put it behind your cookie consent, or use a picture of the map that links out.
- Cards, the footer's column labels and the opening hours don't render headings. Give `PractitionerCard` a `headingLevel` when the names are sections of your page (an `h3` under the grid's `h2`).
- Backgrounds come from `surfaces.css` (see Foundations / Surfaces): `data-surface="bone"` on `<html>`, and `data-theme="dark" data-surface="mineral"` with `bg-background` on a band of the page. A band that changes theme takes `data-accent` on the same element too, if you use one.
- Images are yours: give real `alt` text to photos that say something (the room, the map), `alt=""` to decorative ones and to portraits beside a name.
