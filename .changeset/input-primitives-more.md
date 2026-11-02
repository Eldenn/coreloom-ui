---
'@coreloom/ui': minor
---

### Added

- Form: `PasswordField`, `NumberField`, `TimeField` and `DateTimeField` on `useAppForm`, and
  `maxCount` on `TextField` / `TextareaField` for a character counter.
- `CharacterCount` (`@coreloom/character-count`): "120/280" under a text field, amber near the
  limit, red past it, announced to screen readers only when a threshold is crossed.
- `EditableText` (`@coreloom/editable-text`): text that becomes a field when clicked; Enter or blur
  saves, Escape restores, focus returns to the text.
- `SliderInput` (`@coreloom/slider-input`): a Slider and a NumberInput on one value.
- `MaskedInput` (`@coreloom/masked-input`): groups typed numbers the way they're printed, with
  presets that check them (IBAN, card, SIREN, SIRET) or your own pattern. `isValidIban`,
  `isValidLuhn` and `applyMask` are exported.
- `ColorPicker` (`@coreloom/color-picker`): a "#rrggbb" colour from swatches, a hex field or the
  system colour dialog.
- `Rating` (`@coreloom/rating`): radio-button stars to give a score, or a read-only score with halves.

### Changed

- `SelectTrigger` takes `onClear` and `Combobox` takes `clearable`: a × button that empties the
  field while something is picked. With it, `className` goes on a wrapper around the trigger.
- `NumberInput`: holding − or + repeats the step.
