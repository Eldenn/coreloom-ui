---
'@coreloom/ui': minor
---

### Added

- Form: `MaskedField`, `ColorField`, `RatingField`, `SliderField`, `UnitField`, `DurationField`,
  `MonthField`, `WeekField`, `SegmentedField`, `RadioCardField`, `CheckboxGroupField` and
  `KeyValueField` on `useAppForm`.
- `ChoiceCard` (`@coreloom/choice-card`): `RadioCardGroup`, `RadioCard` and `CheckboxCard`, radio
  buttons and checkboxes drawn as cards with a title, a description and an icon.
- `SegmentedControl` (`@coreloom/segmented-control`): two to five options in one pill, a radio
  group underneath.
- `UnitInput` (`@coreloom/unit-input`): a number with its unit, `{ value, unit }`, with optional
  conversion.
- `DurationInput` (`@coreloom/duration-input`): "1h30", "90" or "1:30" read as minutes;
  `parseDuration` and `formatMinutes` are exported.
- `MonthPicker` (`@coreloom/month-picker`, "YYYY-MM") and `WeekPicker` (`@coreloom/week-picker`,
  ISO "YYYY-Www").
- `KeyValueEditor` (`@coreloom/key-value-editor`): key and value rows, repeated keys flagged,
  pasted "KEY=value" lines split into rows.
- `EmojiPicker` (`@coreloom/emoji-picker`): a built-in, searchable set of common emoji, as a popover
  button or a panel.
- `SignaturePad` (`@coreloom/signature-pad`): sign with a pointer or type a name; a PNG data URL.
- `PasswordStrength` (`@coreloom/password-strength`): a strength meter and rule checklist.
- `CopyInput` in `@coreloom/input-group`: a read-only value with a copy button.
