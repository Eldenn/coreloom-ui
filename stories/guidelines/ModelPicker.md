# ModelPicker

Which model answers: a small trigger with the chosen model's name that opens a searchable list, grouped by provider — what each model is for, its context window, its price per million tokens (input / output) and what it can do (vision, tools, reasoning, fast…).

**The consumer provides** the `models` (`AiModel[]` from `@/lib/ai`: `id`, `name`, and optionally `provider`, `description`, `contextWindow` in tokens, `pricing: { input, output, currency? }` per million tokens, `capabilities`, `disabled`), the `value` and `onValueChange(id)`, plus optionally:

- `variant` — `"ghost"` (the default) in a composer's `toolbar`, `"outline"` in a settings form;
- `size` — `"sm"` (28 px, ghost's default) or `"default"` (42 px, outline's default);
- `placeholder`, `disabled`;
- `aria-labelledby` — a label elsewhere; the name becomes that label followed by the chosen model (otherwise "Model: Claude Sonnet");
- `ModelList` (`models`, `value`, `onValueChange`) for the list inline, without the trigger;
- `ModelField` for the form kit, in its own item so the picker doesn't pull in the form kit: `pnpm dlx shadcn@latest add @coreloom/model-field`, then `<form.AppField name="model">{() => <ModelField label="Model" models={models} />}</form.AppField>`.

- Open with Enter, Space or a click; type to search names, providers, descriptions and capabilities; arrows move, Enter picks and closes, Escape closes and gives focus back.
- The chosen model is checked, and highlighted when the list opens; the trigger's name says what is chosen ("Model: Claude Sonnet").
- Prices and windows follow the locale ("$3 / $15 per 1M", "200K"); screen readers get them in full words.
- A model without a provider goes under "Other"; a `disabled` model is shown but can't be picked (say why in its description).
- Keep descriptions to one short line: what the model is good for, not its spec sheet.
- The list only shows what the app passes: no model is fetched or called from here.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/model-picker` and import from `@/components/ui/model-picker`.
