# Security settings

`TwoFactorSettings` (authenticator app setup, recovery codes, turn off) and `ActiveSessions` (signed-in devices, Sign out).

**Install** `pnpm dlx shadcn@latest add @coreloom/security-settings`. It writes `security-settings.tsx`.

**The consumer provides** `onSetupStart()` → `{ secret, qrCode? }`, `onSetupVerify(code)` → `{ recoveryCodes }` (reject a wrong code), `onDisable`, `onRegenerateCodes`; sessions `{ id, name, device?, location?, ip?, lastActiveAt, current? }` with `onRevoke` and `onRevokeOthers`.

- The code field submits at the sixth digit; recovery codes are shown once with Copy.
- Turn off and Sign out everywhere else are confirmed.

_On `window.CoreloomUIDesignSystem_ff5f32` as `TwoFactorSettings`, `ActiveSessions`._
