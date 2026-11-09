# Presence

Who else is here: stacked avatars with what each person does, "Ada is editing…", and other people's cursors.

**Install** `pnpm dlx shadcn@latest add @coreloom/presence`. Experimental.

**The consumer provides** `users` (`{ id, name, avatarUrl?, status?, activity?, color? }`) and, for `RemoteCursors`, `cursors` (`{ id, x, y }` from 0 to 1). No transport: your app moves the data; `cursorPosition(event, element)` gives the position to send.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Presence`._
