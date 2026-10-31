# Input

Single-line text field.

**The consumer provides** the usual input props. Wrap it in a `Field` with a `FieldLabel` (and `FieldDescription` / `FieldError`); set `aria-invalid` when the value is wrong.

- `surface-inset` well, 1px `border-strong` outline (`border-input`, 3:1 in both themes), `radius-md`, 42px tall, 14px Geist; placeholder in `fg-muted` (4.5:1).
- Focus: `accent` border + `--ring-focus`. `aria-invalid`: `danger` border with a `danger-subtle` glow; focused, the ring turns `danger` at 70% so it still reads 3:1.
- Write errors as instructions: "Enter a valid email address."

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/input` and import from `@/components/ui/input`._
