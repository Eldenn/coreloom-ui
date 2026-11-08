# @coreloom/notification-preferences

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/notification-preferences.tsx

```ts
type NotificationChannel = {}
NotificationChannel.id: string
NotificationChannel.label: string
type NotificationEvent = {}
NotificationEvent.id: string
NotificationEvent.label: string
NotificationEvent.description?: string | undefined
NotificationEvent.group?: string | undefined
NotificationEvent.required?: string[] | undefined
NotificationEvent.unavailable?: string[] | undefined
function NotificationPreferences
NotificationPreferences.events: NotificationEvent[]
NotificationPreferences.channels: NotificationChannel[]
NotificationPreferences.value?: NotificationPreferenceValue | undefined
NotificationPreferences.defaultValue?: NotificationPreferenceValue | undefined
NotificationPreferences.onValueChange?: ((value: NotificationPreferenceValue) => void) | undefined
NotificationPreferences.disabled?: boolean | undefined
NotificationPreferences.title?: React.ReactNode
NotificationPreferences.description?: React.ReactNode
NotificationPreferences.className?: string | undefined
type NotificationPreferenceValue = { [x: string]: string[]; }
function setNotificationChannel(value: NotificationPreferenceValue, event: NotificationEvent, channel: string, on: boolean) => NotificationPreferenceValue
function setNotificationChannelForAll(value: NotificationPreferenceValue, events: readonly NotificationEvent[], channel: string, on: boolean) => NotificationPreferenceValue
```
