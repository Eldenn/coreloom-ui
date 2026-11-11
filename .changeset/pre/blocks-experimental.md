---
'@coreloom/ui': minor
---

### Changed

- Every block is now **experimental**, and so is `RichTextEditor`: the 35 blocks that were stable
  (app shell, auth, settings, dashboard, data list, kanban, inbox, file manager, the AI chat and
  its siblings…) may still change in a minor release, with an **Upgrading** note when they do.
  Nothing changes in their code. The components in `@coreloom/all` other than the rich text
  editor stay stable. Their guides and `llms.txt` say which is which.
