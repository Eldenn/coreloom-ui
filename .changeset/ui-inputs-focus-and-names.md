---
'@coreloom/ui': patch
---

### Fixed

- Focus no longer falls back to the page when the control just used goes away:
  - `ImageInput`: Remove hands the focus to Upload.
  - `PromptInput`: removing an attachment focuses the next one, or the text box after the last.
  - `CommentThread`: sending or cancelling a reply returns the focus to the Reply button that opened it.
  - `MultiSelect`: **Select all** and **Clear** stay in the footer, `aria-disabled` when they have nothing left to do. They also answer to Enter now (it used to toggle the highlighted option).
  - `TransferList`: a move button with nothing to move is `aria-disabled` and stays focusable.
  - `FilterBar`: once a view is saved, the focus moves from **Save view** to **Add filter**.
- `EditableText`: leaving the field with Tab or a click no longer pulls the focus back to the text; Enter and Escape still do. With `required`, an emptied text is put back and screen readers are told.
- `FileUpload`, `ImageInput` and `PromptInput` announce a removed file.
- `EmojiPicker`: the category shortcuts can be reached from the keyboard (one tab stop, Left and Right between them) and show the focus ring.
- `PhoneInput`: the country button shows its own focus ring.
- `SaveStatus`, `SuggestionList`, `LoadMore` and `Tour` show the focus ring where they move the focus after a keyboard action.
- `PromptInput`: the button that removes an attachment is 24 px, up from 20.
- `Marquee`: the pause button no longer reads "Play, pressed"; its name alone says what a press does.
- `Carousel`: a text field, a select, radios or a slider inside a slide keep their arrow keys; a vertical carousel pages with Up and Down. "carousel" and "slide" are announced in the current language.
- `TransferList` and `RecurrenceInput` use the system's `Checkbox` and `RadioGroup` instead of the browser's own controls. The four move buttons of `TransferList` share one look.
- `SegmentedControl`: in a container that stretches it (a `Field`), the options fill the width instead of leaving an empty track.

### Changed

- `Tour`: a step's title is a paragraph that names the card, not an `<h2>`, so it stays out of the page's heading order.
- `Carousel` is named "Carousel" by default; `aria-label` or `aria-labelledby` still names it your way.

### Added

- `SegmentedControl`: an option takes `aria-label`, its accessible name when `label` isn't a string.
- i18n: `carousel.label`, `carousel.roleDescription`, `carousel.slide`, `fileUpload.removed`, `inputs.image.removed`, `inputs.editable.kept`, `inputs.emoji.jump` and `ai.prompt.removedFile`, in the four locales.

### Upgrading

- If you keep your own messages object for another language, add the eight keys above.
- `transfer-list` now installs `checkbox`, and `recurrence-input` installs `radio-group`.
- A test that looked for the tour title with `getByRole('heading')`, or for `aria-pressed` on the marquee button, needs the dialog's name or the button's name instead.
