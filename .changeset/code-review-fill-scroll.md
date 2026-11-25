---
'@coreloom/ui': patch
---

### Fixed

- **CodeReview**: with `fill`, going to a file from the tree only scrolls the review's own files (or its body on a narrow review). It used to scroll every box around the review too, so a dialog it filled lost what sat above it.
