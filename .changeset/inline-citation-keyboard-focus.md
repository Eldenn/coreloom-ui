---
'@coreloom/ui': patch
---

### Fixed

- `InlineCitation`: Enter on a citation you just tabbed back to now always moves focus to the
  card's link. Before, when the card was mounting or still fading out, focus stayed on the card
  itself or on the citation.
