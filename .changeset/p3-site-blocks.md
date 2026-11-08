---
'@coreloom/ui': minor
---

### Added

- **Testimonials** (`@coreloom/testimonials`, experimental): `TestimonialGrid`, `TestimonialWall` (columns with "Show more") and `TestimonialCard`, with avatar, logo, rating and source.
- **Comparison table** (`@coreloom/comparison-table`, experimental): plans side by side under a sticky header, words for every cell, "Only show differences", one plan at a time on phones; `differingFeatures`.
- **Changelog** (`@coreloom/changelog`, experimental): a public changelog page with changes tagged New, Improved, Fixed, Security or Deprecated, a filter by kind, anchors, a feed link and paging; `filterChangelog`, `changeKinds`.
- **Blog** (`@coreloom/blog`, experimental): `BlogList` (featured post, categories, "More posts"), `BlogPostCard`, `BlogArticle` (table of contents, authors, related posts), `AuthorCard`, `AuthorProfile`; `readingTime`.
- **Newsletter** (`@coreloom/newsletter`, experimental): `NewsletterForm` and `Waitlist` (place in line, referral link), with address checks, the callback's errors and a focused thank-you.
- **Cookie consent** (`@coreloom/cookie-consent`, experimental): `CookieConsent` with equal "Reject all" / "Accept all", `CookiePreferences`, and `parseConsent`, `acceptAll`, `rejectAll`.
- **Shop** (`@coreloom/shop`, experimental), without payment: `ProductCard`, `ProductGrid`, `ProductDetail` (swatches, sizes, stock, quantity), `Cart`, `CartSheet`, `CartButton`, `OrderSummary` (promo code, shipping, tax); `cartTotals`, `findVariant`, `isValueAvailable`, `formatMoney`.
- **Voice agent** (`@coreloom/voice-agent`, experimental): `VoiceAgent` with push-to-talk (hold, Space, or hands-free), states, a level meter and a live transcript; `PushToTalkButton`, `LiveTranscript`, `VoiceLevel`.
- Message groups `testimonials`, `comparison`, `changelog`, `blog`, `newsletter`, `cookieConsent`, `shop` and `voice` in English, French, Spanish and German.
