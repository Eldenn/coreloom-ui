# ContextMeter

How much of the model's context window a conversation fills: a small ring (or bar) and a percentage. Hover, focus or tap it for the breakdown — input, cached input, output, reasoning, the total against the window — and the estimated cost.

**The consumer provides** `used` — the AI SDK's usage (`LanguageModelUsage`, v5's flat fields or v6+'s `inputTokenDetails` / `outputTokenDetails`) or a plain token count — plus optionally:

- `model` — gives the window (`contextWindow`), the price (`pricing`) and the currency;
- `max` — the window in tokens, when there's no `model`;
- `cost` — what the conversation cost, when the app knows it; otherwise it's estimated from `model.pricing`;
- `variant` (`"ring"` or `"bar"`) and `showValue`;
- `ContextBreakdown` for the same numbers inline, in a usage panel.

- Amber from 80 %, red from 95 % — and the card says the same in words ("Filling up: start a new chat soon."), so colour is never the only sign.
- It's a `meter` with its value (`aria-valuenow`, `aria-valuemax`) and a text alternative ("42%, 85K of 200K tokens"); the breakdown is its description, so screen readers get it without opening anything.
- The estimate leaves cache discounts out: it's an upper bound. Pass `cost` when the provider reports the real amount.
- Put it at the end of the composer's toolbar, after the model picker: changing the model changes the window.
- Without a window (no `max` and no `model.contextWindow`) it shows nothing.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/context-meter` and import from `@/components/ui/context-meter`.
