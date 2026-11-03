# Prompt manager

One prompt and its versions: the list of versions (with their message, author, date and where they're deployed), an editor, a diff between any two versions, Deploy, and a test bench.

**The consumer provides** `<PromptManager name versions defaultVersionId labels defaultValues onSave onDeploy onTest>`: `versions` are `{ id, version, text, message?, author?, createdAt, labels? }`; `labels` are where a version can be deployed (`["production"]` by default). `onSave({ text, message, baseVersionId })` stores the draft as a new version and may return it (it opens); `onDeploy(versionId, label)` moves a label; `onTest({ text, filled, variables, versionId, signal })` returns text, a promise or an async iterable of chunks.

- `{{variables}}` are found as you type, tinted in the editor and listed under it. `templateVariables(text)` and `fillTemplate(text, values)` are exported for your server.
- Each version keeps its own draft; a version with unsaved changes is marked Draft in the list. Deploy is disabled while there are unsaved changes.
- Compare shows a diff from any version to the open one (or its draft), unified or side by side.
- Test has a field per variable, Run and Stop (the `signal` aborts); the answer streams in, and its end is announced.
- No model is called by the block.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/prompt-manager`.
