"use client"

// Coreloom UI — TeamMembers (team block). The members of a workspace with their role, an invite
// dialog (several emails, one role), pending invites and removal behind a confirmation.
// Everything is data and callbacks: call your API in them; return a promise to show progress.
import * as React from "react"
import { MailIcon, Trash2Icon, UserPlusIcon } from "lucide-react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppForm } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCoreloomI18n } from "@/lib/i18n"

type TeamRole = { value: string; label: string; description?: string }
type TeamMember = { id: string; name: string; email: string; role: string; avatar?: string }
type TeamInvite = { id: string; email: string; role: string; invitedAt: Date }

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function InviteDialog({ roles, onInvite }: { roles: TeamRole[]; onInvite: (emails: string[], role: string) => unknown }) {
  const { messages } = useCoreloomI18n()
  const t = messages.team
  const [open, setOpen] = React.useState(false)
  const form = useAppForm({
    defaultValues: { emails: [] as string[], role: roles[roles.length - 1]?.value ?? "" },
    validators: {
      onChange: z.object({
        emails: z
          .array(z.string())
          .min(1, t.emailsRequired)
          .superRefine((emails, ctx) => {
            const bad = emails.filter((e) => !EMAIL.test(e))
            if (bad.length) ctx.addIssue({ code: "custom", message: t.emailsInvalid(bad.join(", ")) })
          }),
        role: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      await onInvite(value.emails, value.role)
      setOpen(false)
    },
  })
  React.useEffect(() => {
    if (open) form.reset()
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon />
          {t.invite}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t.inviteTitle}</DialogTitle>
            <DialogDescription>{t.inviteDescription}</DialogDescription>
          </DialogHeader>
          <form.AppField name="emails">
            {(field) => <field.TagsField label={t.emails} description={t.emailsHint} placeholder="ada@acme.dev" transform={(v) => v.trim().toLowerCase()} />}
          </form.AppField>
          <form.AppField name="role">{(field) => <field.SelectField label={t.role} options={roles} />}</form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton pendingLabel={t.sending}>{t.send}</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TeamMembers({
  members,
  roles,
  invites = [],
  currentUserId,
  onInvite,
  onRoleChange,
  onRemove,
  onRevoke,
  title,
  description,
  className,
}: {
  members: TeamMember[]
  /** Most powerful first; the invite dialog defaults to the last. */
  roles: TeamRole[]
  invites?: TeamInvite[]
  /** The signed-in member: marked "You", without a remove button or role picker. */
  currentUserId?: string
  onInvite?: (emails: string[], role: string) => unknown
  onRoleChange?: (memberId: string, role: string) => unknown
  onRemove?: (memberId: string) => unknown
  onRevoke?: (inviteId: string) => unknown
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.team
  const pendingId = React.useId()
  const roleLabel = (v: string) => roles.find((r) => r.value === v)?.label ?? v
  const date = (d: Date) => d.toLocaleDateString(locale, { day: "numeric", month: "short" })

  return (
    <Card className={cn("gap-0 p-0", className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle asChild>
          <h2 className="m-0">{title ?? t.title}</h2>
        </CardTitle>
        <CardDescription>{description ?? t.description}</CardDescription>
        {onInvite && (
          <CardAction>
            <InviteDialog roles={roles} onInvite={onInvite} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ul className="m-0 list-none p-0">
          {members.map((m) => {
            const you = m.id === currentUserId
            return (
              <li key={m.id} data-slot="team-member" className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0">
                <Avatar>
                  {m.avatar && <AvatarImage src={m.avatar} alt="" />}
                  <AvatarFallback>{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 truncate text-[14px] font-medium text-foreground">
                    {m.name}
                    {you && <Badge variant="secondary">{t.you}</Badge>}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">{m.email}</span>
                </div>
                {onRoleChange && !you ? (
                  <Select value={m.role} onValueChange={(v) => void onRoleChange(m.id, v)}>
                    <SelectTrigger size="sm" className="w-36" aria-label={t.roleOf(m.name)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="w-36 px-3 text-[13px] text-fg-secondary">{roleLabel(m.role)}</span>
                )}
                {onRemove &&
                  (you ? (
                    <span className="size-8" />
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={t.remove(m.name)}>
                          <Trash2Icon />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.removeTitle(m.name)}</AlertDialogTitle>
                          <AlertDialogDescription>{t.removeDescription}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" onClick={() => void onRemove(m.id)}>
                            {t.removeConfirm}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
              </li>
            )
          })}
        </ul>
        {invites.length > 0 && (
          <section aria-labelledby={pendingId} className="border-t border-border bg-surface/40 px-5 py-3">
            <h3 id={pendingId} className="m-0 mb-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              {t.pending}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {invites.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-muted-foreground [&_svg]:size-4">
                    <MailIcon />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] text-foreground">{inv.email}</span>
                    <span className="text-[12px] text-muted-foreground">
                      {roleLabel(inv.role)} · {t.invitedOn(date(inv.invitedAt))}
                    </span>
                  </span>
                  {onRevoke && (
                    <Button variant="ghost" size="sm" aria-label={t.revoke(inv.email)} onClick={() => void onRevoke(inv.id)}>
                      {t.revokeShort}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

export { TeamMembers, type TeamInvite, type TeamMember, type TeamRole }
