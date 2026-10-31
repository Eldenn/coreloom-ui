# AI Chat Widget

The support bubble in a page's corner: a round launcher with an unread count and an optional greeting next to it, opening the `Chat` in a card above it — a full-screen sheet on phones (below 640px). It is the same Chat, so `useChat` plugs in the same way.

**The consumer provides** everything `Chat` takes (`messages`, `status`, `onSend`, `onStop`, `onRegenerate`, `suggestions`, `toolLabels`…), plus optionally:

- `open` and `onOpenChange` to control it, or `defaultOpen`;
- `title` (it also names the panel), `subtitle` ("Usually answers in a minute"), `avatar` and `presence` (`online`, `away`, `offline`);
- `unread` — the badge on the launcher; reset it in `onOpenChange` when the chat opens;
- `greeting` and `onGreetingDismiss` — remember the dismissal (a cookie, the user's settings) so the greeting shows only once;
- `onClose` for the header's Close button (end the conversation); Minimise only hides it;
- `side` (`right` or `left`), `offset` (px from the corner), `zIndex` and `fullScreen` (default: below 640px).

- Not modal on a desktop: the page stays usable behind the card. On a phone the sheet covers the page, keeps Tab inside it and stops the page behind from scrolling.
- Opening puts the cursor in the composer, whoever opens it (the launcher, or the app through `open` — an "Ask AI" command). Closing gives focus back to the launcher when it was in the panel, and leaves it alone otherwise. A chat that starts open (`defaultOpen`) doesn't move focus.
- Escape, Minimise or Close fold it back. When a citation's card, a hover card or a menu is open inside, Escape closes that first; the next one closes the chat.
- The launcher's name carries the count ("Chat, 2 unread") and says whether it's expanded; new unread messages are announced politely while it's closed.
- It sits at 1200 by default: above sticky headers (1100), under modals (1300), so its own menus (1400) and toasts (1500) show on top. Raise it only if the page has something it must cover.
- The open animation is a short fade and lift, skipped when the reader prefers reduced motion.
- One widget per page, in a corner that doesn't hide the page's own actions (a cookie banner, a mobile tab bar: move it with `offset`).
- Keep the greeting short and specific to the page; never open the chat by itself.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-chat-widget` and import from `@/components/ai-chat-widget`.
