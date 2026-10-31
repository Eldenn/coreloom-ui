// Settings → Members: the team block on TanStack Query. Each action calls the API, then refetches.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { TeamMembers } from '@/components/team'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/sonner'
import { inviteMembers, removeMember, revokeInvite, setMemberRole } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useT } from '@/lib/locale'
import { teamQuery } from '@/lib/queries'

export function MembersSettings() {
  const t = useT()
  const user = useAuth()
  const queryClient = useQueryClient()
  const query = teamQuery({ name: user?.name ?? '', email: user?.email ?? '' })
  const { data } = useQuery(query)
  const refresh = () => queryClient.invalidateQueries(query)
  const invite = useMutation({
    mutationFn: ({ emails, role }: { emails: string[]; role: string }) =>
      inviteMembers(emails, role),
    onSuccess: refresh,
  })
  const role = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => setMemberRole(id, role),
    onSuccess: refresh,
  })
  const remove = useMutation({ mutationFn: removeMember, onSuccess: refresh })
  const revoke = useMutation({ mutationFn: revokeInvite, onSuccess: refresh })

  if (!data) return <Skeleton className="h-72 w-full" />
  const roles = (['owner', 'admin', 'developer', 'viewer'] as const).map((value) => ({
    value,
    label: t.settings.roles[value],
  }))
  return (
    <TeamMembers
      members={data.members}
      invites={data.invites.map((i) => ({ ...i, invitedAt: new Date(i.invitedAt) }))}
      roles={roles}
      currentUserId="me"
      onInvite={async (emails, r) => {
        try {
          await invite.mutateAsync({ emails, role: r })
          toast.success(t.settings.invited(emails.length))
        } catch (error) {
          toast.error((error as Error).message)
          throw error
        }
      }}
      onRoleChange={(id, r) => {
        role.mutate({ id, role: r })
      }}
      onRemove={(id) => {
        remove.mutate(id)
      }}
      onRevoke={(id) => {
        revoke.mutate(id)
      }}
    />
  )
}
