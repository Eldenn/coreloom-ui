# @coreloom/settings

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/settings-layout.tsx

```ts
function SettingsLayout
SettingsLayout.title?: React.ReactNode
SettingsLayout.description?: React.ReactNode
SettingsLayout.nav: SettingsNavItem[]
SettingsLayout.active: string
SettingsLayout.onNavigate?: ((id: string) => void) | undefined
SettingsLayout.children: React.ReactNode
SettingsLayout.className?: string | undefined
type SettingsNavItem = {}
SettingsNavItem.id: string
SettingsNavItem.label: string
SettingsNavItem.icon?: IconLike | undefined
SettingsNavItem.href?: string | undefined
```

## src/components/settings-section.tsx

```ts
function DangerZone
DangerZone.title?: React.ReactNode
DangerZone.description: React.ReactNode
DangerZone.actionLabel: string
DangerZone.confirmTitle: React.ReactNode
DangerZone.confirmDescription: React.ReactNode
DangerZone.resourceName: string
DangerZone.onConfirm: () => unknown
DangerZone.pending?: boolean | undefined
function SettingsRow
SettingsRow.label: React.ReactNode
SettingsRow.description?: React.ReactNode
SettingsRow.htmlFor?: string | undefined
SettingsRow.children: React.ReactNode
function SettingsSection
SettingsSection.title: React.ReactNode
SettingsSection.description?: React.ReactNode
SettingsSection.children: React.ReactNode
SettingsSection.footer?: React.ReactNode
SettingsSection.form?: SectionForm | undefined
SettingsSection.onSubmit?: ((data: FormData) => unknown) | undefined
SettingsSection.pending?: boolean | undefined
SettingsSection.submitLabel?: string | undefined
SettingsSection.className?: string | undefined
```
