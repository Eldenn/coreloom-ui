# Text effects

Four ways to bring a line of text to life, for hero titles, empty states and labels of work in progress: `WordReveal`, `Typewriter`, `ShimmerText` and `GradientText`.

**The consumer provides**, for `WordReveal`, a `text` (split on spaces). Optional: `as` (`span` by default, `p`, `div`, or a heading level you own), `effect` (`up`, `blur`, `fade`), `step` (ms between words, default 60), `delay`, and `trigger` (`in-view` by default, or `mount`). `Typewriter` takes `text`, one phrase or an array. Optional: `speed` (ms per character, 45), `eraseSpeed` (25), `hold` (ms a phrase stays, 1600), `loop`, `caret` (default `true`), `frozen` (shows the first phrase whole) and `onDone`. `ShimmerText` wraps any text, with `duration` (seconds per sweep, 2). `GradientText` wraps any text, with `animate` (default `false`) and `duration` (6).

- Screen readers get the whole text once (all phrases of a typewriter, separated by commas), never letter by letter or word by word.
- For people who ask for reduced motion the words are there at once, the typewriter shows its first phrase, the shimmer and the gradient stand still.
- `ShimmerText` uses a mask, so the text keeps its real color and contrast: use it for a short label of something in progress ("Thinking…"), next to or instead of a spinner.
- `GradientText` is for display sizes: at body size the lighter end of the gradient can fall below 4.5:1.
- One moving text per view. A looping typewriter never ends: keep it to a hero, never in an app screen.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/text-effects` and import from `@/components/ui/text-effects`.
