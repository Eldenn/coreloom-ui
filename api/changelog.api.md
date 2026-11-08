# @coreloom/changelog

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/changelog.tsx

```ts
const CHANGE_KINDS: readonly ['new', 'improved', 'fixed', 'security', 'deprecated']
type ChangeKind = 'improved' | 'new' | 'fixed' | 'security' | 'deprecated'
function changeKinds(entry: ChangelogEntry) => ChangeKind[]
function Changelog
Changelog.entries: ChangelogEntry[]
Changelog.title?: React.ReactNode
Changelog.description?: React.ReactNode
Changelog.feedUrl?: string | undefined
Changelog.onSubscribe?: (() => void) | undefined
Changelog.pageSize?: number | undefined
Changelog.kinds?: ('improved' | 'new' | 'fixed' | 'security' | 'deprecated')[] | undefined
Changelog.defaultKinds?: ('improved' | 'new' | 'fixed' | 'security' | 'deprecated')[] | undefined
Changelog.onKindsChange?: ((kinds: ChangeKind[]) => void) | undefined
Changelog.className?: string | undefined
type ChangelogChange = {}
ChangelogChange.kind: 'improved' | 'new' | 'fixed' | 'security' | 'deprecated'
ChangelogChange.text: React.ReactNode
type ChangelogEntry = {}
ChangelogEntry.id: string
ChangelogEntry.date: Date
ChangelogEntry.version?: string | undefined
ChangelogEntry.title: React.ReactNode
ChangelogEntry.summary?: React.ReactNode
ChangelogEntry.media?: React.ReactNode
ChangelogEntry.changes?: ChangelogChange[] | undefined
ChangelogEntry.body?: React.ReactNode
function filterChangelog(entries: ChangelogEntry[], kinds: readonly ChangeKind[]) => ChangelogEntry[]
```
