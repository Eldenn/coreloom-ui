---
'@coreloom/ui': minor
---

### Added

- `Toolbar` and its parts (`@coreloom/toolbar`): a row of tools that is one Tab stop, with
  arrow-key navigation, toggle groups, links, separators and a More menu.
- `ActionBar` (`@coreloom/action-bar`): a bar for the selected items, with their count, bulk
  actions, and Escape or a close button to clear the selection.
- `Popconfirm` (`@coreloom/popconfirm`): a small confirmation anchored to its trigger, Cancel
  focused first, with an async confirm.
- `SecretValue` (`@coreloom/secret-value`): an API key or token as dots, with Show and Copy;
  `maskSecret` is exported.
- `FormatNumber`, `AnimatedNumber` and `formatValue` (`@coreloom/format`): numbers, percentages,
  currencies, compact numbers and bytes written for the locale, and a count-up.
- `NotificationBadge` (`@coreloom/notification-badge`): a count (99+) or a dot on an icon or an
  avatar, with the count in words for screen readers.
- `OverflowList` (`@coreloom/overflow-list`): a one-line row that shows what fits and ends with
  "+N" opening the rest.
- `FileCard` and `FileCardList` (`@coreloom/file-card`): an attached file with its type, size,
  upload progress, error, Retry and Remove.
- `useHotkeys`, `Hotkey` and `ShortcutsDialog` (`@coreloom/keyboard-shortcuts`): shortcuts with
  "mod" and sequences, drawn as keys, and a dialog listing them.
- `Countdown` (`@coreloom/countdown`): the time left as a clock, boxes or a short phrase, with
  `onComplete`.
- `QuotaBar` (`@coreloom/quota-bar`): how much of a limit is used, by segment, turning amber then
  red near the limit.
