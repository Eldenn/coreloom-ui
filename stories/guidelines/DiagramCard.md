# Diagram Card

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A card in a gallery of diagram documents (architectures, models): a thumbnail, the title, who can see it, how many diagrams it holds, when it changed, and a "…" menu. The whole card opens the document.

**The consumer provides** `title`, `href` (the document's address, through `AppLink`: wrap the app in `CoreloomLinkProvider` to use its router), `visibility` (`private`, `public` or `protected`), `updatedAt` (a Date), and optionally `diagram` (a `UmlSpec`, drawn with UML Diagram's `preview`) or `image` (the URL of a thumbnail the app already made; used when there's no `diagram`), `diagramCount` (the number of diagrams, "4 diagrams"), `actions` (the menu: `{ label, icon?, onSelect, destructive?, disabled? }[]`, such as Open, Duplicate, Share, Delete; no menu when empty) and `className`.

- The title is a link stretched over the card, so a click anywhere opens it and keyboard users meet one link per card, named by the title. Its focus ring is drawn around the card.
- The "…" menu is a separate button after the link, named "Actions for Checkout"; arrow keys move in the menu and Escape closes it. Delete goes in red and does what the app says: ask first (an AlertDialog) before deleting.
- Visibility is a badge with an icon and a word (Private, Public, Protected), never colour alone.
- The thumbnail is decoration, hidden from screen readers: the title already names the card. Without a diagram or an image, a neutral drawing of two boxes stands in.
- "Updated 5 minutes ago" uses RelativeTime, with the full date in its tooltip.
- Put cards in a list (`ul` / `li`) in a responsive grid; give the page its own heading, since the card has none.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-card`.
