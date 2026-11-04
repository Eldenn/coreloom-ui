# Marketing page

Landing page sections as one installable block: header, hero, features, FAQ, call to action and footer.

**Install** `pnpm dlx shadcn@latest add @coreloom/marketing`. It writes `hero.tsx`, `feature-grid.tsx`, `faq.tsx` and `cta-section.tsx`, plus `site-header.tsx`, `site-footer.tsx` and `copy-button.tsx`.

**The consumer provides**:

- `<SiteHeader brand links actions mobileActions>`. Links move into a sheet on phones.
- `<Hero announcement title highlight description actions command>`. `highlight` ends the headline in a gradient of the accent text colour (`highlightStyle="solid"` for plain accent text); `command` adds a copyable install line. Children go below, for a product shot. `layout="split"` or `"cover"` with `media` adds a photo (`mediaPosition`: `end` by default, or `start`): see the Showcase block. `glow` turns the faint accent top-light on or off (on for the centred layout).
- `<FeatureGrid eyebrow title features featured>`. Features are `{ icon, title, description, meta? }`, and `featured` picks the glowing card.
- `<Faq items>` with `{ question, answer }` items.
- `<CtaSection title description actions>`.
- `<SiteFooter note links>`. Add `brand`, `columns` (`{ title, links?, content? }`) and `social` for a multi-column site footer.

- Sections are separated by `border-subtle` rules and stay within 1120px. The hero headline is `font-display` 40–72px. The only gradients are the faint accent top-light and the highlight.
- Keep copy concrete. A feature's `meta` is a real package name or number, or nothing: leave it out rather than invent one.
- One primary action per screen: the hero's and the CTA's "Get started".
