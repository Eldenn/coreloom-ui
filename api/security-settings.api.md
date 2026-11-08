# @coreloom/security-settings

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/security-settings.tsx

```ts
type ActiveSession = {}
ActiveSession.id: string
ActiveSession.name: string
ActiveSession.device?: 'phone' | 'desktop' | 'laptop' | 'tablet' | undefined
ActiveSession.location?: string | undefined
ActiveSession.ip?: string | undefined
ActiveSession.lastActiveAt: Date
ActiveSession.current?: boolean | undefined
function ActiveSessions
ActiveSessions.sessions: ActiveSession[]
ActiveSessions.onRevoke?: ((id: string) => unknown) | undefined
ActiveSessions.onRevokeOthers?: (() => unknown) | undefined
ActiveSessions.title?: React.ReactNode
ActiveSessions.description?: React.ReactNode
ActiveSessions.className?: string | undefined
function TwoFactorSettings
TwoFactorSettings.enabled: boolean
TwoFactorSettings.enabledAt?: Date | undefined
TwoFactorSettings.recoveryCodesLeft?: number | undefined
TwoFactorSettings.onSetupStart?: (() => TwoFactorSetup | Promise<TwoFactorSetup>) | undefined
TwoFactorSettings.onSetupVerify?: ((code: string) => { recoveryCodes: string[]; } | Promise<{ recoveryCodes: string[]; }>) | undefined
TwoFactorSettings.onDisable?: (() => unknown) | undefined
TwoFactorSettings.onRegenerateCodes?: (() => string[] | Promise<string[]>) | undefined
TwoFactorSettings.title?: React.ReactNode
TwoFactorSettings.description?: React.ReactNode
TwoFactorSettings.className?: string | undefined
type TwoFactorSetup = {}
TwoFactorSetup.secret: string
TwoFactorSetup.qrCode?: React.ReactNode
```
