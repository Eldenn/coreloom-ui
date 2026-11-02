# ScaleInput

A row of points to answer a survey question: "How likely are you to recommend us?" from 0 to 10 (NPS), or "Strongly disagree" to "Strongly agree" (Likert).

**The consumer provides** `min` and `max` (1 to 5 by default; 0 to 10 for NPS), `value` + `onValueChange` (a number, `null` before an answer), a name (`aria-label` or `aria-labelledby`), and optionally `minLabel` and `maxLabel` (words under the ends), `labels` (one per point, shown instead of the numbers), `name` and `disabled`.

- It is a radio group: Tab reaches it once, arrows move along the scale. The end words join the first and last points' names ("0, Not at all likely"), so they are heard where they apply.
- With `labels`, give exactly one per point; the points then show the words and wrap on a narrow screen.
- Use it for opinions on a scale. Use Rating for stars on something people used, and Slider for a continuous amount.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/scale-input` and import from `@/components/ui/scale-input`._
