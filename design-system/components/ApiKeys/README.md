# API keys

The workspace's API keys, with Create (the secret shown once) and Revoke.

**Install** `pnpm dlx shadcn@latest add @coreloom/api-keys`. It writes `api-keys.tsx`.

**The consumer provides** `<ApiKeys keys scopes onCreate onRevoke>`: keys `{ id, name, prefix, last4, scopes?, createdAt, createdBy?, lastUsedAt?, expiresAt? }`; `onCreate({ name, scopes, expiresInDays })` returns `{ secret }`.

- The new key is shown once in a `SecretValue` with Copy. The list only needs the prefix and the last 4 characters.
- Revoke asks first.

_On `window.CoreloomUIDesignSystem_ff5f32` as `ApiKeys`._
