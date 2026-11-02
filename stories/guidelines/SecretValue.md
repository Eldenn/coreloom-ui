# SecretValue

A value that should not sit on screen in clear: an API key, a token, a webhook secret, a recovery code.

**The consumer provides** the `value` and a `label` ("API key"), used in the buttons' names. Optional: `visibleStart` and `visibleEnd` (characters kept in clear, 0 and 4 by default), `copy` (true), `revealed` / `defaultRevealed` / `onRevealedChange`, and `onReveal` to log who looked. `maskSecret` is exported.

- Keep a few characters in clear (a prefix such as `cl_live_`, the last four) so people can tell keys apart without showing them.
- Copy copies the real value without showing it; Show is a toggle button (pressed while shown).
- Show a full secret only once, when it is created, if your backend can't read it back; afterwards show the masked form only.
- For a value people type, use PasswordInput instead.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/secret-value` and import from `@/components/ui/secret-value`.
