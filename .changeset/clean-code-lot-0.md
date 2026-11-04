---
'@coreloom/ui': patch
---

### Fixed

- **Rich text editor** and **Settings section**: the link field and the "type to confirm" field take their id from `React.useId()` instead of a fixed string, so two instances on one page no longer share a label target.

### Added

- `renderIcon` and the `IconLike` type (`@coreloom/render-icon`), and `initials` (`@coreloom/initials`): the helpers that AppSidebar, NavUser, CommandMenu, FeatureGrid and SettingsLayout (icons), and Team, Kanban, Inbox, AuditLog and CommentThread (avatar initials) each carried their own copy of. Those blocks now install them; nothing changes in how they render.
