# Textarea

Multi-line text field that grows with its content.

**The consumer provides** the usual textarea props; wrap it in a `Field` and set `aria-invalid` on errors.

- Same well as `Input` — `surface-inset`, `border-strong`, `radius-md`, 14px / 1.5 — at least 86px tall, growing with content (`field-sizing: content`) and resizable vertically.
- For code, add `className="font-mono"`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/textarea` and import from `@/components/ui/textarea`._
