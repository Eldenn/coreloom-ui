# ChoiceCard

Radio buttons and checkboxes drawn as cards, with a title, a description and an optional icon: a plan, a delivery option, the add-ons to turn on.

**The consumer provides** `RadioCardGroup` with `value` + `onValueChange` (or `defaultValue`), a name for the group (`aria-labelledby` pointing at its label) and optionally `orientation` (`vertical`, or `horizontal` for a responsive row), `disabled` and `aria-invalid`; each `RadioCard` takes `value`, `title`, and optionally `description`, `icon`, `disabled` and children (a price, a badge). `CheckboxCard` takes `checked` + `onCheckedChange` (or `defaultChecked`), `title`, `description`, `icon`, `name` and `value`.

- Each card is a real `<input>` inside its `<label>`: the whole card is clickable, arrows move between radio cards, Space ticks a checkbox card, and the description is read after the title.
- The picked card gets a `primary` border on `primary-subtle`; the focus ring goes around the card.
- Group several `CheckboxCard` in a `<fieldset>` with a `<legend>`. Keep titles short and put the detail in the description.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/choice-card` and import from `@/components/ui/choice-card`._
