# @coreloom/presence

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/presence.tsx

```ts
function cursorPosition(event: { clientX: number; clientY: number; }, element: { getBoundingClientRect: () => { left: number; top: number; width: number; height: number; }; }) => { x: number; y: number; }
function PresenceActivity
PresenceActivity.users: readonly Pick<PresenceUser, 'color' | 'id' | 'name'>[]
PresenceActivity.verb?: ((names: string, count: number) => string) | undefined
PresenceActivity.announce?: boolean | undefined
PresenceActivity.className?: string | undefined
function PresenceAvatars
PresenceAvatars.users: readonly PresenceUser[]
PresenceAvatars.max?: number | undefined
PresenceAvatars.size?: 'sm' | 'lg' | 'default' | undefined
PresenceAvatars.className?: string | undefined
function presenceColor(user: Pick<PresenceUser, 'id' | 'color'>) => string
type PresenceUser = {}
PresenceUser.id: string
PresenceUser.name: string
PresenceUser.avatarUrl?: string | undefined
PresenceUser.status?: 'idle' | 'active' | undefined
PresenceUser.activity?: string | undefined
PresenceUser.color?: string | undefined
type RemoteCursor = {}
RemoteCursor.id: string
RemoteCursor.x: number
RemoteCursor.y: number
function RemoteCursors
RemoteCursors.users: readonly PresenceUser[]
RemoteCursors.cursors: readonly RemoteCursor[]
RemoteCursors.children?: React.ReactNode
RemoteCursors.className?: string | undefined
```
