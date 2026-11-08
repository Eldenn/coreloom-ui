# Changelog

A public changelog page with tagged changes, a filter by kind and anchors. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/changelog`. It writes `changelog.tsx`.

**The consumer provides** `<Changelog entries title description feedUrl onSubscribe>`: entries `{ id, date, version?, title, summary?, media?, changes?: { kind, text }[], body? }`, newest first; kind is new, improved, fixed, security or deprecated.

- Each entry has an `h2` and an anchor. "Show older updates" pages through them (`pageSize` 10).

_On `window.CoreloomUIDesignSystem_ff5f32` as `Changelog`._
