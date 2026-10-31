# InlineCitation

The small numbered pill a model leaves in its answer ("…in about a minute [1]"), pointing at one of the message's sources. Hover it, focus it or tap it and a card shows the source: its title, the site or the file it comes from, and — for a web page — a link to open it.

**The consumer provides** the source `index` (from 1: its place among the message's sources) and the AI SDK `source` part as is (`source-url` or `source-document`), plus optionally `className`. In a chat there is nothing to wire: give `Markdown` the message's `sources` and it turns the model's `[1]` markers into citations (the chat does this for you).

- The pill is a button named after its source ("Source 1: Deployments guide"), not just "1".
- Hovering or tabbing onto it peeks at the card without moving focus; moving the pointer away or tabbing on closes it. Clicking, tapping or Enter pins it open (a peeking card stays), and Enter also moves focus into the card, to the link. Escape closes it and, if focus was in the card, puts it back on the pill; a click elsewhere closes it and leaves focus where you clicked.
- Touch screens can't hover: a tap opens the card, a second tap closes it.
- A source without a title shows its site; a document shows its file name (or type) and has no link.
- Only `http`, `https` and `mailto` addresses become a link; anything else (`javascript:`, `data:`) shows the title without one.
- Number sources in the order the message lists them, the same order as the chips under the answer, so `[2]` in the text is chip 2.
- Ask the model for `[n]` markers in your system prompt ("cite sources as [1], [2]"), after a space or punctuation. A number with no source stays plain text, and so do `x[1]`, `items[2]` and an escaped `\[1\]`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/inline-citation` and import from `@/components/ui/inline-citation`.
