# Notification preferences

Which notifications someone gets, and where: events by channels, a checkbox per cell and per channel.

**Install** `pnpm dlx shadcn@latest add @coreloom/notification-preferences`. Experimental.

**The consumer provides** `events` (`{ id, label, description?, group?, required?, unavailable? }`), `channels` (`{ id, label }`) and `value` + `onValueChange` (`{ [eventId]: channelIds[] }`).

_On `window.CoreloomUIDesignSystem_ff5f32` as `NotificationPreferences`._
