---
'@coreloom/ui': minor
---

### Added

- `@coreloom/showcase`: sections for the public site of a practice, a studio or a firm. `PractitionerCard` and `PractitionerGrid` (portrait or initials, profession, specialties, bio, facts, booking actions). `ContactSection`, `ContactDetails` (address with a directions link, phone, email, access and parking) and `OpeningHours` (the week in the locale's format, today marked, "Open now · Closes at 12:30" / "Opens tomorrow at 9:00", exceptional hours; `openingStatus` is exported). `MediaSection` (image beside text), `Quote` (default, large or card) and `LegalLayout` (legal notice or privacy policy with numbered sections and a table of contents). Guide: Blocks / Showcase.
- `surfaces.css` in `@coreloom/theme`: the mineral and bone surface presets (`data-surface` on `<html>` or on a band), every background, border and text grey in both themes, checked AA with every accent preset by `build/gen-surfaces.py`. Storybook has a Surface toolbar. Guide: Foundations / Surfaces.
- `Hero` takes `media` with `layout="split"` (image beside the text, `mediaPosition`) or `layout="cover"` (image behind a scrim, dark theme), an `eyebrow`, `highlightStyle="solid"` and `glow`; extra props go to the `<section>`.
- `SiteFooter` takes `brand`, `columns` (`{ title, links?, content? }`) and `social` for a multi-column footer. Its link row's label is translated.

### Changed

- `Hero`'s highlight gradient follows the accent (from the accent text colour towards the text colour) instead of a fixed cyan, so it matches every accent preset and generated accent.
- Accent presets and generated accents (`generateAccent`) also apply on an element that is itself `data-theme="dark"` inside a light page, so a dark band keeps its accent: put `data-accent` on the same element as `data-theme`.

### Upgrading

- Re-add `@coreloom/theme` for `surfaces.css` and import it after `accents.css`. Regenerate a `brand.css` made with the theme generator if a dark band of your page should use it.
