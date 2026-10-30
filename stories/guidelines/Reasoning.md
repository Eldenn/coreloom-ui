# Reasoning

A model's thinking, folded under one line: "Thinking…" with a spinner while it streams (open, so people can follow), then "Thought for 6 s", closed.

**The consumer provides** the reasoning part's `text`, plus optionally `streaming` (the part's state is `streaming`), `duration` in seconds (measured from the stream when left out) and `defaultOpen`.

- The line is a disclosure button: it says whether it is expanded and toggles with Enter or Space.
- When thinking ends it folds away by itself, unless `defaultOpen` was set.
- Render one per AI SDK `reasoning` part, in the order of the parts.
- Thinking is secondary: it stays muted and never pushes the answer below the fold.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/reasoning` and import from `@/components/ui/reasoning`.
