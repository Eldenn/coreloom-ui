# Form Renderer

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Builds a form at runtime from a **FormSpec**: a JSON description of its sections, fields, checks and conditions. Use it when the form's shape comes from data (a settings page your server describes, a survey, a form made in the Form builder block) rather than from code.

**The consumer provides** `spec` and `onSubmit(values)`, and optionally `defaultValues`, `onValuesChange`, `submitLabel`, `hideHeader`, `hideSubmit` and `types`. For an editor around the form (FormBuilder's canvas does this): `showHidden` shows fields whose condition is false, `renderField(field, node, visible)` wraps each field and `renderSection(section, node)` each section's grid.

```tsx
import { FormRenderer, readFormSpec } from '@/components/ui/form-renderer'

const { spec, issues } = readFormSpec(await fetchFormFromServer())
<FormRenderer spec={spec} onSubmit={(values) => save(values)} />
```

**The format.** `{ version: 1, title?, description?, submitLabel?, sections: [{ id, title?, description?, columns?, fields: [...] }] }`. A field has a `name` (its key in the values), a `type`, a `label`, and optionally `description`, `placeholder`, `required`, `defaultValue`, `span` (columns it takes), `visibleWhen`, checks (`minLength`, `maxLength`, `pattern` + `patternMessage`, `min`, `max`, `minItems`, `maxItems`), `options` (`[{ value, label }]`) and its type's own settings, flat (`currency`, `defaultCountry`, `accept`, `multiple`, `step`…). `{ title, fields: [...] }` (one section, what ToolForm takes) is accepted too.

The form's `title` is a paragraph that names the `<form>` (`aria-labelledby`), not a heading: put your own heading above it (and pass `hideHeader`) when the page's outline needs one.

**Types.** Text: `text`, `email`, `url`, `textarea`, `password`, `phone`, `otp`, `masked` (`preset`: `iban`, `card`, `siren`, `siret`), `mention` (`options`, `trigger`). Numbers: `number`, `money`, `rating` (`max`; 0 is no score), `slider`, `scale` (`min`, `max`, `minLabel`, `maxLabel`, `labels`), `unit` (`units`: a list), `numberrange`. Choices: `select`, `combobox`, `radio`, `radiocards` (options with a `description`), `segmented`, `multiselect`, `checkboxes`, `chips` (`single`), `tags`, `treeselect` (options with `children`, `multiple`), `transfer`, `sortable` (a ranking; untouched, it submits the options' order), `checkbox`, `switch`. Dates: `date`, `daterange`, `time`, `timerange` (`overnight`), `datetime`, `month`, `week`, `duration` (minutes), `recurrence` (`frequencies`), `timezone`. Other: `color`, `image`, `file`, `keyvalue` (rows without a key are left out), `json` (checked as JSON, sent as text): one per Form field, in `formFieldTypes`. Add your own with `types={{ ...formFieldTypes, mine }}`: an entry gives its `render(field, label)` (a field component inside `form.AppField`), its `empty` value, and optionally `emptyOf` / `isEmpty`, `fromJSON` / `toJSON`, `validate`, and the `settings` and `checks` the builder offers.

**Conditions.** `visibleWhen: { field, op, value }` with `op` one of `equals`, `notEquals`, `in`, `filled`, `empty`, `gt`, `lt`, `contains`; combine with `{ all: [...] }` or `{ any: [...] }`. A hidden field is not checked and not submitted, and a field that depends on a hidden one is hidden too.

- **Values are JSON.** Dates are `"YYYY-MM-DD"`, date and time `"YYYY-MM-DDTHH:mm"` (local), times `"HH:mm"`, ranges `{ from, to }`, numbers numbers, choices strings or string[]. Empty optional fields submit `null` (lists `[]`, toggles `false`). Files (and a new image) stay `File` objects.
- **Errors on Submit**, as in Form: each field says what's wrong once it has been left or the form sent, from the locale's messages. Optional fields say so in their label.
- **A spec from elsewhere is untrusted.** `readFormSpec(value)` keeps what is well formed and returns `issues` for the rest: unknown types become text, fields without a usable name or with a duplicate name are dropped, at most 200 fields, conditions on missing fields are removed. Labels render as text, never HTML. Patterns run against what the person types only; check the values again on your server.
- **JSON Schema.** `fromJSONSchema(schema, uiSchema?)` maps an object schema to a spec (formats, enums and `oneOf` consts, bounds, `required`, defaults; `ui:order`, `ui:widget`, `ui:placeholder`, `ui:help`, `ui:options`). Nested objects become sections, with their fields flat in the values. `toJSONSchema(spec)` returns `{ schema, uiSchema }` to validate what the form sends.
- A new `spec` starts the form over with fresh values.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/form-renderer` and import from `@/components/ui/form-renderer`.
