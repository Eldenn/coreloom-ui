# Testimonials

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

What customers say, as cards with the quote, who said it and, if you have them, their portrait, their company's logo, a rating and where it was published. `TestimonialGrid` lines the cards up in even rows; `TestimonialWall` stacks many of them in columns of different heights and keeps the rest behind "Show more".

**The consumer provides** `testimonials`: `{ id, quote, author, byline?, avatar?, logo?, rating?, source?, featured? }`. `avatar` is an `<img alt="">` (the name is beside it), `logo` an `<img>` whose `alt` is the company, `rating` a score out of 5 (halves allowed), `source` `{ label, href? }` ("on G2"), `featured` spans two columns in a grid.

**`TestimonialGrid` takes** `testimonials` and `columns` (2 or 3, default 3, one column on phones).

**`TestimonialWall` takes** `testimonials`, `initialCount` (default 9) and `columns` (2, 3 or 4, default 3).

**`TestimonialCard` takes** one `testimonial`, for a sidebar or between two sections.

- Each card is a `<figure>` with a `<blockquote>` and a `<figcaption>`; the list has an accessible name ("Testimonials", or your `aria-label`).
- The rating is read as "4.5 out of 5 stars", never by colour alone. A source link opens in a new tab and says so.
- "Show more" reveals the rest and moves focus to the first card it revealed.
- Use real quotes with the person's consent; don't invent ratings.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/testimonials`.
