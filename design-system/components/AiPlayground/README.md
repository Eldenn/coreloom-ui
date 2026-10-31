# AI Playground

Compare models or settings side by side: one system prompt and one message, up to three variants (model and temperature), each answer streamed into its own column with latency, tokens and cost.

**The consumer provides** `models`, `defaultVariants`, `results` (per variant: status `idle`, `running`, `done` or `error`, text, and metrics) and `onRun({ system, prompt, variants })`, plus optionally `defaultSystem`, `defaultPrompt` and `maxVariants`.

- Run all runs every variant; each column is marked busy while its answer streams.
- Variants can be added and removed; the last one cannot be removed.
- Answers render as Markdown, so formatting differences show.
- On small screens the columns stack.
- A playground calls real models: keep it behind sign-in and rate limits on the server.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-playground`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
