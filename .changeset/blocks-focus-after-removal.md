---
'@coreloom/ui': patch
---

### Fixed

- Keyboard focus no longer drops to the page when a control removes itself:
  - `ApiKeys` (Revoke), `ActiveSessions` (Sign out) and `KnowledgeBase` (Remove): focus moves to
    the next row's button, the previous one's, or the list when it is empty. `KnowledgeBase` also
    returns focus to the row's menu when the removal is cancelled.
  - `Playground`: removing a variant focuses the neighbouring variant's Remove button, or the model
    picker of the last variant left.
  - `TerminalConsole`: closing the second pane of a split with its own button focuses the tab that
    stays.
  - `DataListToolbar`, `DataListEmpty` and `FacetedFilter`: "Clear filters" hands focus to the
    search box (the panel's own search box in `FacetedFilter`).
  - `NotificationsMenu`: "Mark all as read" keeps focus in the panel.
- `RunTrace` and `RetrievalTest` no longer read a whole pane or every passage aloud on each change:
  a one-line status announces the step picked, or the number of passages found.
- `SiteHeader`: the links show the focus ring, the phone menu marks the current page
  (`aria-current`), and the two navigations have distinct, translated names. `SettingsLayout`: the
  section navigation's name is translated.
- `Changelog`: the entry's anchor link is a 24 px target and readable at rest.

### Changed

- Inner labels are no longer headings, so they stay out of the host page's heading order: the step
  list, step name and Error / Input / Output labels in `RunTrace`, the titles of `RetrievalTest`
  and of each `Playground` variant, and the title of the `NotificationsMenu` panel. Their look and
  the names of their regions are unchanged.
