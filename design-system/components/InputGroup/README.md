# Input Group

A field with things attached inside its border: an icon, a prefix like `https://`, a unit, a button, a keyboard hint, or a toolbar above or below a textarea. `PasswordInput` (show/hide) and `SearchInput` (clear) are ready-made groups.

**The consumer provides** the parts: `InputGroup` around one `InputGroupInput` (or `InputGroupTextarea`) and any number of `InputGroupAddon`s with `align` — `inline-start` (default), `inline-end`, `block-start`, `block-end`. Inside an addon: an icon, `InputGroupText`, a `Kbd`, or `InputGroupButton` (`size` `xs` default, `sm`, `icon-xs`, `icon-sm`; `variant` `ghost` default). The field takes the usual input props, the `id` for its `FieldLabel`, and `aria-invalid`.

- `PasswordInput` takes input props (not `type`) and `showLabel`; its button is a toggle with `aria-pressed`, named "Show password" from i18n.
- `SearchInput` takes `value` + `onValueChange` (or `defaultValue`) and `clearLabel`. The clear button shows once there is text; Escape clears too, and focus stays in the field.
- The group draws one border: focus and `aria-invalid` on the field light the whole group, like `Input`. Order in code doesn't matter; `align` places the addon.
- A click on an addon's empty space focuses the field. Only the field and real buttons are tab stops.
- Icon-only buttons need an `aria-label`. Keep addons short; a long prefix belongs in the label.
- Don't put the field's meaning only in an icon: the label still says what to type.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/input-group` and import from `@/components/ui/input-group`._
