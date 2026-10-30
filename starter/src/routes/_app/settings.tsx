import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { BellIcon, CreditCardIcon, PaletteIcon, SettingsIcon, UsersIcon } from "lucide-react"
import { z } from "zod"

import { BillingSettings } from "@/components/billing-settings"
import { MembersSettings } from "@/components/members-settings"
import { SettingsLayout } from "@/components/settings-layout"
import { DangerZone, SettingsRow, SettingsSection } from "@/components/settings-section"
import { AccentPicker, useTheme, type ThemePreference } from "@/components/theme-toggle"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAppForm } from "@/components/ui/form"
import { toast } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { auth } from "@/lib/auth"
import { useCoreloomI18n } from "@/lib/i18n"
import { useT } from "@/lib/locale"

// Each section has its own URL (/settings?section=notifications): the nav items are links,
// so they work with the back button and open in a new tab.
export const Route = createFileRoute("/_app/settings")({
  validateSearch: z.object({ section: z.enum(["general", "appearance", "members", "billing", "notifications"]).catch("general").default("general") }),
  staticData: { crumb: (t) => t.nav.settings },
  component: SettingsPage,
})

function SettingsPage() {
  const t = useT()
  const { section } = Route.useSearch()
  return (
    <SettingsLayout
      title={t.settings.title}
      description={t.settings.description}
      active={section}
      nav={[
        { id: "general", label: t.settings.general, icon: SettingsIcon, href: "/settings" },
        { id: "appearance", label: t.settings.appearance, icon: PaletteIcon, href: "/settings?section=appearance" },
        { id: "members", label: t.settings.members, icon: UsersIcon, href: "/settings?section=members" },
        { id: "billing", label: t.settings.billing, icon: CreditCardIcon, href: "/settings?section=billing" },
        { id: "notifications", label: t.settings.notifications, icon: BellIcon, href: "/settings?section=notifications" },
      ]}
    >
      {section === "general" && <GeneralSettings />}
      {section === "appearance" && <AppearanceSettings />}
      {section === "members" && <MembersSettings />}
      {section === "billing" && <BillingSettings />}
      {section === "notifications" && <NotificationSettings />}
    </SettingsLayout>
  )
}

function GeneralSettings() {
  const t = useT()
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: { name: "Coreloom", slug: "coreloom" },
    validators: {
      onChange: z.object({
        name: z.string().min(1, t.settings.nameRequired),
        slug: z.string().regex(/^[a-z0-9-]+$/, t.settings.slugFormat),
      }),
    },
    onSubmit: async () => {
      // Replace with your API call; the button shows its busy state until this resolves.
      await new Promise((resolve) => setTimeout(resolve, 700))
      toast.success(t.settings.saved)
    },
  })
  return (
    <>
      <SettingsSection title={t.settings.general} description={t.settings.generalHint} form={form}>
        <form.AppField name="name">{(field) => <field.TextField label={t.settings.workspaceName} autoComplete="organization" />}</form.AppField>
        <form.AppField name="slug">
          {(field) => <field.TextField label={t.settings.slug} description={t.settings.slugHint} autoComplete="off" />}
        </form.AppField>
      </SettingsSection>
      <DangerZone
        description={t.settings.dangerHint}
        actionLabel={t.settings.deleteWorkspace}
        confirmTitle={t.settings.deleteTitle}
        confirmDescription={t.settings.deleteText}
        resourceName="coreloom"
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          toast(t.settings.deleted)
          auth.signOut()
          await navigate({ to: "/login" })
        }}
      />
    </>
  )
}

function NotificationSettings() {
  const t = useT()
  const [prefs, setPrefs] = React.useState({ deploys: true, failures: true, digest: false })
  const toggle = (key: keyof typeof prefs) => (checked: boolean) => {
    setPrefs((p) => ({ ...p, [key]: checked }))
    toast.success(t.settings.saved)
  }
  return (
    <SettingsSection title={t.settings.notifications} description={t.settings.notificationsHint}>
      <SettingsRow label={t.settings.deploys} description={t.settings.deploysHint} htmlFor="n-deploys">
        <Switch id="n-deploys" checked={prefs.deploys} onCheckedChange={toggle("deploys")} />
      </SettingsRow>
      <SettingsRow label={t.settings.failures} description={t.settings.failuresHint} htmlFor="n-failures">
        <Switch id="n-failures" checked={prefs.failures} onCheckedChange={toggle("failures")} />
      </SettingsRow>
      <SettingsRow label={t.settings.digest} htmlFor="n-digest">
        <Switch id="n-digest" checked={prefs.digest} onCheckedChange={toggle("digest")} />
      </SettingsRow>
    </SettingsSection>
  )
}

// The same choices as the header's theme menu, plus the accent: both apply at once and are kept in
// localStorage (index.html applies them before the first paint).
function AppearanceSettings() {
  const t = useT()
  const ui = useCoreloomI18n().messages.theme
  const { preference, setTheme } = useTheme()
  return (
    <SettingsSection title={t.settings.appearance} description={t.settings.appearanceHint}>
      <div className="flex flex-col gap-3 border-b border-border-subtle pb-4">
        <span id="appearance-theme" className="text-[14px] font-medium text-foreground">
          {t.settings.theme}
        </span>
        <RadioGroup aria-labelledby="appearance-theme" value={preference} onValueChange={(v) => setTheme(v as ThemePreference)} className="flex flex-wrap gap-x-6 gap-y-3">
          {(["light", "dark", "system"] as const).map((value) => (
            <div key={value} className="flex items-center gap-2">
              <RadioGroupItem id={`theme-${value}`} value={value} />
              <Label htmlFor={`theme-${value}`}>{ui[`${value}Option`]}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-3">
        <span id="appearance-accent" className="text-[14px] font-medium text-foreground">
          {ui.accent}
        </span>
        <AccentPicker aria-labelledby="appearance-accent" />
      </div>
    </SettingsSection>
  )
}
