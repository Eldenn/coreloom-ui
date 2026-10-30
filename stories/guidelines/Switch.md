# Switch

On/off toggle for settings that apply immediately.

**The consumer provides** `checked` + `onCheckedChange` (or `defaultChecked`), an `id`, a `Label`, and optionally `size="sm"`.

- 42×25 (`sm` 34×21) pill. Off: `surface-hover` with a `border-strong` outline (3:1) and a white thumb; on: `accent` track with an `fg-on-accent` thumb that slides on `--ease-spring`, the one playful motion the system allows.
- `role="switch"`; Space toggles; focus shows `--ring-focus`.
- Only for changes that take effect at once ("Dark mode", "Auto-deploy main"). If it needs a Save button, use a `Checkbox`. Label the setting, not the state.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/switch` and import from `@/components/ui/switch`.
