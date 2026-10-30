# Team

The members of a workspace: who they are, their role, pending invites; invite and remove.

**Install** `pnpm dlx shadcn@latest add @coreloom/team`. It writes `team.tsx`.

**The consumer provides** `<TeamMembers members roles invites currentUserId onInvite onRoleChange onRemove onRevoke>`: `members` are `{ id, name, email, role, avatar? }`, `roles` are `{ value, label }` (most powerful first; invites default to the last), `invites` are `{ id, email, role, invitedAt }`. Callbacks may return a promise; a rejected `onInvite` keeps the dialog open.

- A `Card` with the title and **Invite** at the top, one row per member (avatar, name, email, a role `Select`, a remove button), then the pending invites (dashed avatar, role and date, **Revoke**).
- **Invite** opens a dialog: several emails in a `TagsInput` (each checked) and one role. Removing asks first in an `AlertDialog`. The signed-in member is marked "You" and can't remove or demote themselves.
- Leave out a callback to hide its control (read-only views for non-admins).
