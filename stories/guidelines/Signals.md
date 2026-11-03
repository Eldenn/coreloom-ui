# Signals

Motion that tells people something happened or is happening: a dot that pulses on what is new, a burst of confetti for a real success, a bar while the next page loads, dots while someone types.

**The consumer provides:**

- `Ping` (`@coreloom/ping`) wraps any element and puts a dot in a corner: `tone` (`primary`, `success`, `warning`, `destructive`), `active` (pulses, default true), `label` (said by screen readers, such as "New" or "3 unread"), `position` (`top-right` by default). `PingDot` is the dot alone, to put next to a word.
- `fireConfetti(origin?, { count, spread, duration })` (`@coreloom/confetti`): bursts from an element, a `{ x, y }` point or the top of the screen (60 pieces, 220 px, 1.4 s). It returns a promise and cleans up after itself.
- `PageProgress` (`@coreloom/page-progress`): `loading` and an optional `label` ("Loading the page"). Wire `loading` to your router's pending state.
- `TypingIndicator` (`@coreloom/typing-indicator`): `name` ("Lena is typing" for screen readers), `label` to replace the sentence, `bubble` (default true).

- A pulse never carries the meaning alone: give `Ping` a `label`, or say it in the text next to it. Keep one pulsing dot per view.
- Confetti is for real, rare successes. It does nothing for people who ask for reduced motion, so the success is always said in words too (a toast, a heading).
- `PageProgress` is a `progressbar` that is busy while loading; don't add another loading announcement for the same load.
- `TypingIndicator` is a polite status; show it only while someone is actually typing.

**In an app:** `pnpm dlx shadcn@latest add` followed by the items you need (`@coreloom/ping` `@coreloom/confetti` `@coreloom/page-progress` `@coreloom/typing-indicator`), and import from `@/components/ui/<item>`.
