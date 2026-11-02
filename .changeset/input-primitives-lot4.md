---
'@coreloom/ui': minor
---

### Added

- Form: `ChipField`, `ScaleField`, `NumberRangeField`, `TimeRangeField`, `JsonField`,
  `MentionField`, `TreeSelectField` and `TransferField` on `useAppForm`.
- `ChipGroup` (`@coreloom/chip-group`): pills that toggle on and off, as checkboxes (a `string[]`)
  or radios (`type="single"`), with optional counts.
- `ScaleInput` (`@coreloom/scale-input`): a survey scale, NPS (0–10) or worded Likert, as a radio
  group.
- `NumberRangeInput` and `TimeRangePicker` (`@coreloom/range-inputs`): two ends of a range, either
  may stay empty, an upside-down range flagged; `overnight` for night shifts.
- `JsonInput` (`@coreloom/json-input`): a code field for JSON that says on which line and column it
  breaks, with Format; `parseJson` is exported.
- `MentionTextarea` (`@coreloom/mention-textarea`): a textarea with "@" suggestions that stays
  plain text; `mentionsIn` lists who a text mentions.
- `TreeSelect` (`@coreloom/tree-select`): a select whose options nest, one value or several;
  `flattenTree` is exported.
- `TransferList` (`@coreloom/transfer-list`): two filterable lists with buttons to move items
  between them.
- `Combobox`: `onCreate` offers "Create “…”" when no option has the searched label.
