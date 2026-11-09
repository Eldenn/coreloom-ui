# Version history

The saved versions of a document, diagram or prompt: by day, named, compared (DiffViewer), restored.

**Install** `pnpm dlx shadcn@latest add @coreloom/version-history`. Experimental.

**The consumer provides** `versions` (`{ id, createdAt, name?, author?, summary?, content? }`), `currentId`, `onRestore(id)`, `onRename(id, name)` and `renderPreview(version)` for what isn't text.

_On `window.CoreloomUIDesignSystem_ff5f32` as `VersionHistory`._
