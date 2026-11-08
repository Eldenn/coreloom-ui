# @coreloom/team

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/team.tsx

```ts
type TeamInvite = {}
TeamInvite.id: string
TeamInvite.email: string
TeamInvite.role: string
TeamInvite.invitedAt: Date
type TeamMember = {}
TeamMember.id: string
TeamMember.name: string
TeamMember.email: string
TeamMember.role: string
TeamMember.avatar?: string | undefined
function TeamMembers
TeamMembers.members: TeamMember[]
TeamMembers.roles: TeamRole[]
TeamMembers.invites?: TeamInvite[] | undefined
TeamMembers.currentUserId?: string | undefined
TeamMembers.onInvite?: ((emails: string[], role: string) => unknown) | undefined
TeamMembers.onRoleChange?: ((memberId: string, role: string) => unknown) | undefined
TeamMembers.onRemove?: ((memberId: string) => unknown) | undefined
TeamMembers.onRevoke?: ((inviteId: string) => unknown) | undefined
TeamMembers.title?: React.ReactNode
TeamMembers.description?: React.ReactNode
TeamMembers.className?: string | undefined
type TeamRole = {}
TeamRole.value: string
TeamRole.label: string
TeamRole.description?: string | undefined
```
