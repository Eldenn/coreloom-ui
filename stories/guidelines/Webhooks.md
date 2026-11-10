# Webhooks

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The endpoints a workspace sends events to: URL, description, the events they listen to, on / off, the signing secret, and each endpoint's recent deliveries with the payload sent, the response and Redeliver.

**The consumer provides** `<Webhooks endpoints deliveries events defaultOpenId onCreate onToggle onDelete onRedeliver onSendTest onRevealSecret title description>`: `endpoints` are `{ id, url, description?, events, enabled, secret? }`, `events` the catalogue `{ value, label, description? }`, `deliveries` `{ id, endpointId, event, status, statusCode?, at, durationMs?, attempt?, payload?, response? }` with `status` succeeded, failed or pending.

- Add endpoint asks for an https URL (http is refused: payloads would travel in clear), a description and the events (a multi-select).
- Details opens an endpoint: its signing secret in a `SecretValue` (Show and Copy; `onRevealSecret` lets you log who looked), the deliveries filtered All / Failed, Send test event.
- Each delivery opens to show the JSON payload and the response. Redeliver shows progress while your promise runs.
- The switch turns an endpoint on and off at once; Delete asks first.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/webhooks`.
