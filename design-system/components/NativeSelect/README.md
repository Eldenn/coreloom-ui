# Native Select

The browser's own `<select>`, styled like the other fields, with `NativeSelectOption` and `NativeSelectOptGroup`.

**The consumer provides** the usual select props (`value` + `onChange`, or `defaultValue`), an `id` for its `FieldLabel`, `size` (`default` 42px, `sm` 32px) and `aria-invalid` when the choice is wrong.

- On phones it opens the system picker, which beats any custom list there. It also works without JavaScript and autofills.
- Use it in long forms and for short lists of plain text. Use `Select` for a styled list with icons or descriptions, `Combobox` when people need to search.
- For "nothing chosen yet", add a first option with `value=""` and `disabled`, and say what to pick ("Choose a plan").
- The chevron is decorative; the label names the control.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/native-select` and import from `@/components/ui/native-select`._
