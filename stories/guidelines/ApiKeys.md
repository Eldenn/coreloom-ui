# API keys

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The workspace's API keys: name, the key's visible start and end, its access, who created it and when, when it was last used and when it expires. Create and Revoke.

**The consumer provides** `<ApiKeys keys scopes onCreate onRevoke title description>`: `keys` are `{ id, name, prefix, last4, scopes?, createdAt, createdBy?, lastUsedAt?, expiresAt? }`, `scopes` are `{ value, label, description? }` (leave it out for keys with full access). `onCreate({ name, scopes, expiresInDays })` creates the key on your server and returns `{ secret }` (`expiresInDays` is 30, 90, 365 or null for never); a rejected promise keeps the form open.

- Create opens a dialog: name, access (checkboxes, all ticked by default), expiry. On success the dialog shows the new key in clear once, in a `SecretValue` with Copy, with a warning that it won't be shown again.
- The list never needs the secret: only `prefix` and `last4`. Store keys hashed.
- Revoke asks first in an `AlertDialog`.
- Leave out a callback to hide its control.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/api-keys`.
