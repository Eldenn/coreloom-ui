---
'@coreloom/ui': minor
---

### Added

- `FormRenderer` (`@coreloom/form-renderer`): builds a form at runtime from a FormSpec, a JSON
  description of its sections (in 1 to 3 columns), fields, checks and conditions (`visibleWhen`),
  with the Form fields. Values come back as JSON. `formFieldTypes` is the registry of field types
  (45, one per Form field: from text and money to chips, tree select, ranking,
  recurrence, time zone, image, key-value and JSON), extended with `types={{ ...formFieldTypes, mine }}`. `readFormSpec` reads
  an untrusted spec and reports what it fixed or left out; `fromJSONSchema` (with a
  react-jsonschema-form style UI schema) and `toJSONSchema` convert from and to JSON Schema.
- `FormBuilder` block (`@coreloom/form-builder`): makes a FormSpec without code, with a palette of
  field types, a live canvas (drag and drop, keyboard included), an inspector for each field,
  section and the form, a Preview, the JSON (editable FormSpec, or JSON Schema) and Import.
