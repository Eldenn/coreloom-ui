# AI components

The pieces the AI blocks are made of, usable on their own. They read the AI SDK's message parts as they are.

## PromptInput

The composer at the bottom of a chat: a text box that grows with its content, optional attachments, a toolbar slot (model picker, tools) and Send — which becomes Stop while a reply is on its way.

**The consumer provides** `onSubmit({ text, files })` and `status` (`ready`, `submitted`, `streaming` or `error` — the AI SDK's `useChat` status as is), plus optionally:

- `onStop` (shows Stop while submitted or streaming — wire `stop` from `useChat`);
- `value`, `defaultValue` and `onValueChange` to control the text;
- `allowAttachments` and `accept` for files, shown as chips with a remove button;
- `toolbar`, `placeholder`, `disabled` and `autoFocus`.

- Enter sends, Shift + Enter breaks the line; Enter while composing with an input method (Japanese, Chinese…) never sends.
- The shortcut is written out for screen readers and linked to the box with `aria-describedby`.
- Empty or whitespace-only text never sends; the box clears after sending and keeps focus.
- Keep the toolbar to a few compact controls; put settings in the agent, not the composer.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/prompt-input` and import from `@/components/ui/prompt-input`.

## Markdown

A model's answer, rendered: headings, lists, tables, task lists, links, inline code and code blocks with their language and a Copy button (react-markdown with GitHub-flavoured Markdown).

**The consumer provides** the Markdown text as `children`, plus optionally `streaming` (shows a caret after the last character while the answer arrives), `sources` and `className`.

`sources` takes the message's AI SDK source parts (`source-url`, `source-document`) in order. The model's markers — `[1]`, `[1][2]` — then become inline citations that show the source on hover, focus or tap. Markers inside code and links stay as written, and so do escaped ones (`\[1\]`) and ones right after a letter or digit (`items[1]`); a number with no source stays plain text, and a half-written `[1` while streaming is just text until it closes. A bracketed number never links anywhere: if the text defines it (`[1]: https://…`), it is still a citation of source 1 — or plain `[1]` when there is no such source.

- Raw HTML in the text is skipped, never rendered: model output is untrusted.
- Links open in a new tab with `rel="noreferrer noopener"`; jumps within the answer (footnotes) stay in the page. Addresses go through react-markdown's safe-URL filter (`javascript:` and the like are dropped).
- Code blocks are a figure captioned by their language, with Copy (it shows a tick once copied). A block whose lines don't fit scrolls sideways and then takes focus, so the keyboard can scroll it; one that fits isn't a tab stop.
- Footnotes (`[^1]`) are listed under a translated "Footnotes" label — a paragraph, not a heading, so the page's outline stays yours — with translated "Back to reference" links. Their ids are unique to each block.
- Task-list checkboxes are read-only and named "Done" or "To do".
- Citations are numbered buttons named after their source ("Source 1: Deployments guide"); see Inline Citation.
- Use it for any text that came from a model; for text people write, use the rich text editor.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/markdown` and import from `@/components/ui/markdown`.

## Reasoning

A model's thinking, folded under one line: "Thinking…" with a spinner while it streams (open, so people can follow), then "Thought for 6 s", closed.

**The consumer provides** the reasoning part's `text`, plus optionally `streaming` (the part's state is `streaming`), `duration` in seconds (measured from the stream when left out) and `defaultOpen`.

- The line is a disclosure button: it says whether it is expanded and toggles with Enter or Space.
- When thinking ends it folds away by itself, unless `defaultOpen` was set.
- Render one per AI SDK `reasoning` part, in the order of the parts.
- Thinking is secondary: it stays muted and never pushes the answer below the fold.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/reasoning` and import from `@/components/ui/reasoning`.

## ToolCall

One tool invocation in a conversation: its name, a status (preparing, running, done, failed, waiting for approval, denied), and — unfolded — the input and output as JSON, or the error.

**The consumer provides** the AI SDK tool `part` as is (`tool-<name>` or `dynamic-tool`), plus optionally:

- `label` — a human name ("Search the docs") instead of the tool's identifier;
- `tool` — generative UI: `{ render(call), label?, display? }` draws the call as your own component in any state, inside the card (`display: 'card'`, default) or in place of it (`'inline'`); `render` returning `undefined` keeps the card's view. Type it with `ToolComponent<Input, Output>`; see Generative UI;
- `renderOutput(output)` to show a result as UI (a table, a card) instead of JSON — return `undefined` to keep the JSON; a drawn result shows unfolded (`tool` takes precedence);
- `onApprovalResponse({ id, approved })` for tools that ask first — wire `addToolApprovalResponse` from `useChat`;
- `defaultOpen`.

- The status is text and an icon, never colour alone; failures open by themselves.
- A tool waiting for approval shows Allow and Deny; nothing runs until someone chooses.
- Mark tools that change things (send, delete, deploy, pay) as needing approval on the agent.
- JSON is shown in a scrollable code block; very long outputs stay inside the card.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tool-call` and import from `@/components/ui/tool-call`.

## InlineCitation

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

## Editor AI

AI inside `RichTextEditor`: select text, press ⌘J / Ctrl+J (or the **AI** button), then type an instruction or pick a quick action — improve, fix spelling and grammar, shorten, lengthen, summarise, translate. The answer streams into a preview; nothing touches the document until the person chooses **Replace selection** or **Insert below**. Front-end only: your app calls the model.

**The consumer provides** `ai={{ onRequest }}` on the editor. `onRequest({ action, prompt, language, text, scope, signal })` returns the answer as an `AsyncIterable<string>` of pieces (each appended — the AI SDK's `textStream` fits) or a `Promise<string>`. `text` is the selection as light Markdown, or the whole document when nothing is selected (`scope` says which); `prompt` is the person's instruction when `action` is `"custom"`; `language` is the BCP 47 target of `"translate"`. Optionally:

- `actions` — the quick actions to offer, in order (default: all six);
- `languages` — what Translate offers (default `en`, `fr`, `es`, `de`), named in the reader's language;
- `defaultOpen` — open the panel on mount, or pass a command (`{ action: "custom", prompt: "Draft release notes" }`) to run it right away.

- Pass `signal` to your fetch or `streamText`: Stop, Escape, closing the panel and Try again all abort it. Stop keeps what was written so far (or, if nothing came yet, goes back to the instruction field).
- `text` and the answer are light Markdown: paragraphs (a line ending in `\` or two spaces is a line break; other line breaks are spaces), `##` headings, `-` and `1.` lists nested by indentation, `>` quotes, code fences, `---`, `**bold**`, `*italic*`, `~~strike~~`, `` `code` ``, `[links](https://…)`, and `<u>underline</u>`. So bold, italic, strike, underline, inline code and links survive a rewrite; a code block's language and a quote's inner structure don't.
- The answer is inserted as text nodes and marks, never parsed as HTML: `<u>` is the one tag read (as underline), any other tag stays text. Links keep only `http`, `https` and `mailto` addresses; any other link keeps its words without the address.
- `*` and `_` mark emphasis only at word edges (stricter than CommonMark), so `MAX_RETRY_COUNT`, `file_name.ts`, `__init__.py`, `src/*/x.ts` and `2*3*4` stay as written. Characters that would read as Markdown are escaped with `\` in `text`.
- One sentence rewritten inside a paragraph stays inline; anything with blocks replaces the selection as blocks. Insert below goes after the block holding the selection (or at the end), and Summarise makes it the default action.
- The selection stays highlighted while the panel is open. Escape closes the panel and puts focus back in the editor, on the same selection. Each change is one undo step.
- If the selected text disappears while the panel is open (the app reloads `value`, a collaborator deletes it), Replace selection, Insert below and Try again turn off and the panel says why; the rest of the document is never touched in its place.
- Errors show in the panel with **Try again**; the message of an `Error` you throw is shown under the generic text, so throw messages meant for people ("The model is busy. Try again in a minute.").
- Screen readers hear "Writing…", then "Suggestion ready." from a polite live region; the preview is a labelled, focusable region; every action is a button in tab order.
- Without `ai` the editor looks and behaves as before: no button, no shortcut. The selection-highlight extension is always registered (it does nothing until the panel opens), so `ai` can be turned on after mount.
- Label AI output as a suggestion and keep the person in charge: never apply an answer without them choosing to.

**In the ⌘K palette:** `CommandMenu` takes `onAskAi(query)`. Once something is typed, "Ask AI: “…”" comes first in the list (and stays when nothing else matches); choosing it closes the palette and hands you the query — open your assistant with it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/rich-text-editor` (the AI panel is `rich-text-ai.tsx`, installed with it) and `@coreloom/command-menu`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
