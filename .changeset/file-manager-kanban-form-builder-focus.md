---
'@coreloom/ui': patch
---

### Fixed

- `FileManager`: opening a folder (Enter, double-click, the breadcrumb, Open), going back up
  (Backspace, Alt+Up), **Move to**, Delete and **Clear** left keyboard focus on the page. Focus
  now lands on an item of the list, or on the empty state when the folder has none. The Delete key
  clears the selection like the Delete button does.
- `FileManager`: the sort buttons of the list view say the direction ("Sort by Name, sorted
  ascending"). The tick on an item shows on touch screens, in the list view too, with a 24 px
  target, so several items can be selected without a keyboard.
- `KanbanBoard`: **Move to** in a card's menu left focus on the page; it now follows the card to
  its new column.
- `FormBuilder`: deleting a field or a section, or removing the last option of a field, left focus
  on the page. Focus goes to the section, the form, or the option before.
- `FormBuilder`: the drag instructions for screen readers were in English in every locale.
  "Copied" and the JSON tab's error are each announced once.
- `KanbanBoard` and `FormBuilder`: the drag handles' role description ("draggable") follows the
  locale.

### Changed

- `FormBuilder`: the "Add a field", "Settings" and "Submitted values" labels are paragraphs, not
  headings, so they no longer sit in the host page's heading outline.
- `fileManager.sortedBy`, `kanban.roleDescription`, `formBuilder.dnd.instructions` and
  `formBuilder.dnd.roleDescription` are new strings in the four locales.
