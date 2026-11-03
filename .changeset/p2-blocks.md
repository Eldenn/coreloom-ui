---
'@coreloom/ui': minor
---

### Added

- `Gantt` (`@coreloom/gantt`, block): a roadmap on a timeline, with progress bars, milestones,
  dependency arrows (red when a task starts too early), groups, a today line and a day / week / month
  zoom. With `onTaskChange`, bars move and resize with the mouse or the arrow keys (Shift moves the
  end).
- `StatusPage` (`@coreloom/status-page`, block): the overall state, components with 90 days of
  uptime, ongoing incidents with their updates and past incidents. `UptimeBar` (a slider that reads
  each day aloud) and `IncidentTimeline` are exported too.
- `ApiKeys` (`@coreloom/api-keys`, block): keys with their visible ends, access, last use and expiry;
  Create shows the new secret once in a `SecretValue`; Revoke is confirmed.
- `Webhooks` (`@coreloom/webhooks`, block): endpoints with events, on / off and signing secret, and
  their deliveries with payload, response, Redeliver and Send test event.
- `TwoFactorSettings` and `ActiveSessions` (`@coreloom/security-settings`, block): two-step sign-in
  with an authenticator app (setup, code, recovery codes, turn off) and the signed-in devices.
- `AuditLog` (`@coreloom/audit-log`, block): events grouped by day, with search, actor and action
  filters, details, Export and Load more.
- `Integrations` (`@coreloom/integrations`, block): connectable apps as cards, with search and
  category filters; Connect, Configure, Disconnect.
- `PromptManager` (`@coreloom/prompt-manager`, block): a prompt's versions, an editor that finds
  `{{variables}}`, a diff between versions, Deploy to a label and a streamed test. `templateVariables`
  and `fillTemplate` are exported.
- `apiKeys`, `webhooks`, `security`, `auditLog`, `integrations`, `gantt`, `statusPage` and
  `promptManager` message groups in en, fr, es and de.

### Upgrading

- New strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you
  use them) with `--overwrite` before adding these items.
