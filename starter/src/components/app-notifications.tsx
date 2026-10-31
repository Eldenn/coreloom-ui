// The header's notifications: data from the API (TanStack Query), worded in the app's language,
// marked read optimistically so the badge updates at once.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, RocketIcon, UserIcon } from 'lucide-react'

import { NotificationsMenu } from '@/components/notifications'
import { markNotificationsRead, type Notification } from '@/lib/api'
import { formatRelative } from '@/lib/format'
import { useCoreloomI18n } from '@/lib/i18n'
import { useT } from '@/lib/locale'
import { notificationsQuery } from '@/lib/queries'

const icons = { deployed: <RocketIcon />, joined: <UserIcon />, buildFailed: <AlertTriangleIcon /> }

export function AppNotifications() {
  const t = useT()
  const { locale } = useCoreloomI18n()
  const queryClient = useQueryClient()
  const { data = [] } = useQuery(notificationsQuery)
  const markRead = useMutation({
    mutationFn: markNotificationsRead,
    onMutate: async (ids) => {
      await queryClient.cancelQueries(notificationsQuery)
      const previous = queryClient.getQueryData<Notification[]>(notificationsQuery.queryKey)
      queryClient.setQueryData<Notification[]>(notificationsQuery.queryKey, (list = []) =>
        list.map((n) => (ids === 'all' || ids.includes(n.id) ? { ...n, read: true } : n)),
      )
      return { previous }
    },
    onError: (_error, _ids, context) =>
      queryClient.setQueryData(notificationsQuery.queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries(notificationsQuery),
  })

  return (
    <NotificationsMenu
      items={data.map((n) => ({
        id: n.id,
        icon: icons[n.event],
        title: t.overview.events[n.event](n.subject),
        description:
          n.event === 'buildFailed' && n.detail ? t.overview.typeErrorIn(n.detail) : n.detail,
        time: formatRelative(n.at, locale),
        read: n.read,
        href: n.href,
      }))}
      onMarkRead={(id) => {
        markRead.mutate([id])
      }}
      onMarkAllRead={() => {
        markRead.mutate('all')
      }}
    />
  )
}
