---
'@coreloom/ui': minor
---

### Added

All of these are experimental: their API may still change in a minor release.

- **Load more** (`@coreloom/load-more`): the end of a paged list, as a button or loaded as it scrolls into view, with
  loading, error (Try again) and end states; `loadMoreStatus` maps a TanStack infinite query to it.
- **Presence** (`@coreloom/presence`): `PresenceAvatars` (who is here, idle shown), `PresenceActivity`
  ("Ada is editing…") and `RemoteCursors` (named pointers over a shared surface).
- **Image crop** (`@coreloom/image-crop`): move and zoom an image in a frame (pointer, keyboard, slider), round
  for avatars; `cropImage` returns the cropped File.
- **Notification preferences** (`@coreloom/notification-preferences`): an event × channel matrix with a toggle
  per channel, required and unavailable cells.
- **Environment variables** (`@coreloom/env-vars`): variables per environment, secrets masked, `.env` import
  with a preview, and a comparison between environments. `@coreloom/dotenv` parses `.env` text.
- **Feature flags** (`@coreloom/feature-flags`): flags per environment with a switch, a rollout percentage,
  targeting rules and history; `evaluateFeatureFlag` evaluates them the same way.
- **Version history** (`@coreloom/version-history`): versions grouped by day, named versions, a diff with the
  previous or current one, and restore.
- **SQL explorer** (`@coreloom/sql-explorer`): schema tree, query tabs in a SQL editor (Mod+Enter runs),
  virtualised results, cancel and CSV export. Your `onRun` runs the query.
- **Agent run replay** (`@coreloom/ai-agent-replay`): play back a multi-agent run from its spans, with a
  timeline, the agent graph at that moment, the turns and per-agent metrics.
- **Image input** has a `crop` prop: the chosen image is framed in a dialog first, and the value is the cropped
  File.

### Fixed

- **Slider**: `aria-valuetext` now reaches the thumb (the element with the slider role) when there is one value.
