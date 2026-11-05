# Access Code Gate

The screen in front of a protected link, in AuthLayout: one box per character of the access code. Letters are upper-cased, characters outside the alphabet ignored, a pasted code fills every box, and it sends by itself when full.

**`AccessCodeGate` takes** `title`, `onSubmit(code) => Promise<void>`, and optionally `length` (8), `alphabet` (upper-case letters and digits without 0, O, 1, I, L), `pending`, `error`, `attemptsLeft`, `lockedUntil` (a countdown runs until then) and `className`.

- A wrong code empties the boxes and focuses the first one.
- Attempts left show under the boxes; when locked, the boxes are off until the countdown ends.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/access-code-gate`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
