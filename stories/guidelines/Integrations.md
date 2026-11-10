# Integrations

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The apps a workspace can connect, as a grid of cards: logo, name, category, what it does, whether it's connected (and as whom), with search and category filters.

**The consumer provides** `<Integrations integrations onConnect onConfigure onDisconnect>`: `integrations` are `{ id, name, description, logo?, category?, connected?, account?, unavailable? }`. `onConnect(id)` runs your OAuth flow (a popup, a redirect); return a promise to show progress on the button. `unavailable` disables Connect with a note ("On the Team plan").

- The filters are chips: All, Connected (when any is), then each category, with counts. The number of results is announced.
- Connected apps show Configure (with `onConfigure`) and Disconnect (with `onDisconnect`, after a confirmation).
- Logos are decorative; the name is the card's label.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/integrations`.
