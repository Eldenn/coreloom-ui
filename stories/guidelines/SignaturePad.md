# SignaturePad

A box to sign in with a finger, a pen or the mouse: delivery receipts, consent forms, contracts.

**The consumer provides** `onValueChange` (a PNG data URL when a stroke ends, null once cleared), a name (`aria-label` or `aria-labelledby`), and optionally `height` (160), `id` (for a FieldLabel on the typed-name field), `aria-invalid` and `disabled`.

- "Type instead" swaps drawing for a name field and writes the name as the signature, for people who can't draw with a pointer (keyboard, screen reader, tremor). "Draw instead" goes back.
- The box is an image named "Signature, empty" or "Signature, signed"; Clear empties it.
- It records an image, not a legal electronic signature: pair it with your consent text and store who signed and when on your side.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/signature-pad` and import from `@/components/ui/signature-pad`.
