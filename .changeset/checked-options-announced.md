---
'@coreloom/ui': patch
---

### Fixed

- `data-list`, `multi-select`: screen readers announce which options of the faceted filter and the multi-select are checked. The list used `aria-selected` for it, which cmdk overwrites with the keyboard highlight; picked options now carry `aria-checked`, and the faceted filter's list is `aria-multiselectable`.
