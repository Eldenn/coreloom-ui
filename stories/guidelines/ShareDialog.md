# Share Dialog

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The window where someone decides who can open a document: only them, anyone with the link, or the link and a code. It shows the link to copy, the code (hidden until asked), and can make a new link or a new code. The app makes, stores and checks links and codes; the dialog shows them and calls back.

**The consumer provides** `open` and `onOpenChange` (or `defaultOpen`, to show it as it mounts), `title` (the document's name, in the dialog's title and the copied message), `visibility` (`private`, `public` or `protected`) and `onVisibilityChange(visibility) => Promise<void>`, and optionally `link` (shown when public or protected), `code` (shown when protected), `onRegenerateLink` and `onRegenerateCode` (`() => Promise<void>`; no button without them), `pending` (the app is loading the settings: the choices are off, `false` by default), `error` (a problem to show at the top) and `className`.

- Three radio cards: Private "Only you", Public "Anyone with the link", Protected "The link and a code". Arrow keys move between them, as in any radio group.
- A choice applies through `onVisibilityChange`: the card shows a spinner until the promise settles. If it rejects, the old choice comes back and the dialog says it couldn't change it. One change at a time; the cards stay focusable meanwhile.
- The link and the code follow the applied choice, not the one still being applied. The link is a read-only field (focusing it selects it) with a Copy button.
- "Regenerate the link" and "Generate a new code" ask first, in a Popconfirm that says what happens: the old link stops working, people who entered the old code lose access. A failure is shown at the top of the dialog.
- The code sits in SecretValue: dots until the eye button shows it, and Copy copies it without showing it.
- "Copy link and code" (protected only) copies a short message with the document's name, the link and the code, ready to paste in a chat or an email. A toast confirms it.
- Escape or the close button closes the dialog and focus goes back to the button that opened it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/share-dialog`.
