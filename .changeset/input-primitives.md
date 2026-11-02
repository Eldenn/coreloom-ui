---
'@coreloom/ui': minor
---

### Added

- `InputGroup` (`@coreloom/input-group`): a field with addons inside its border (icon, prefix,
  unit, button, keyboard hint, or a toolbar above or below a textarea), following shadcn's parts:
  `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`.
  Two ready-made groups: `PasswordInput` (show/hide toggle) and `SearchInput` (clear button,
  Escape clears).
- `ButtonGroup` (`@coreloom/button-group`): buttons, selects, inputs or a text label joined edge to
  edge, horizontal or vertical, with `ButtonGroupSeparator` and `ButtonGroupText`.
- `NumberInput` (`@coreloom/number-input`): a number typed the reader's way, with − / + buttons and
  spin-button keys (arrows, Shift or Page Up/Down, Home/End). Units and percents through
  `formatOptions`; `parseNumber` and `stepNumber` are exported.
- `NativeSelect` (`@coreloom/native-select`): the browser's `<select>` styled like the other fields.
- `AspectRatio` (`@coreloom/aspect-ratio`): Radix's aspect ratio box, as in shadcn.
- `TimePicker` and `DateTimePicker` (`@coreloom/time-picker`): a time typed ("14:30", "2:30 pm",
  "14h30") or picked from a list, shown in the reader's clock, with an `"HH:mm"` value; the
  date-time picker joins it with a `DatePicker` into one `Date`.
- i18n: new `inputs` group (show password, clear search, increase / decrease, time list and error,
  date / time part names) in English, French, Spanish and German.
