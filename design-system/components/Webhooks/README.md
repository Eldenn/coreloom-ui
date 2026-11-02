# Webhooks

Webhook endpoints, their signing secret and their deliveries.

**Install** `pnpm dlx shadcn@latest add @coreloom/webhooks`. It writes `webhooks.tsx`.

**The consumer provides** `<Webhooks endpoints deliveries events onCreate onToggle onDelete onRedeliver onSendTest onRevealSecret>`.

- Add endpoint accepts https URLs only. Details shows the secret (Show, Copy), deliveries (All / Failed) and Send test event.
- Each delivery opens to its JSON payload and response; Redeliver shows progress.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Webhooks`._
