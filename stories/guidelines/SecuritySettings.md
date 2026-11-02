# Security settings

Two cards for the security page. `TwoFactorSettings` turns on two-step sign-in with an authenticator app; `ActiveSessions` lists where the account is signed in.

**`TwoFactorSettings` takes** `enabled`, `enabledAt?`, `recoveryCodesLeft?`, `onSetupStart()` (create the secret on your server; return `{ secret, qrCode? }`, where `qrCode` is your rendering of the otpauth:// URI, on a light background), `onSetupVerify(code)` (check the 6 digits; reject when wrong; return `{ recoveryCodes }`), `onDisable()` and `onRegenerateCodes()` (returns the new codes).

**`ActiveSessions` takes** `sessions` (`{ id, name, device?, location?, ip?, lastActiveAt, current? }`), `onRevoke(id)` and `onRevokeOthers()`.

- Set up opens a dialog: the QR code, the key to type by hand (masked, with Show and Copy), and the code field, which submits by itself at the sixth digit. A wrong code says so and empties the field.
- Recovery codes are shown once, with Copy, after the setup and after New recovery codes. Under 3 codes left, the count turns to a warning.
- Turn off and Sign out everywhere else ask first. The current session is marked and can't be signed out from here.
- The block checks nothing: codes, secrets and sessions live on your server.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/security-settings`.
