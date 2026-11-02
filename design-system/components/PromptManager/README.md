# Prompt manager

One prompt and its versions: edit, save, compare, deploy, test.

**Install** `pnpm dlx shadcn@latest add @coreloom/prompt-manager`. It writes `prompt-manager.tsx`.

**The consumer provides** `<PromptManager name versions labels defaultValues onSave onDeploy onTest>`: versions `{ id, version, text, message?, author?, createdAt, labels? }`; `onTest` returns text, a promise or an async iterable, with an AbortSignal.

- `{{variables}}` are tinted and listed as you type; `templateVariables` and `fillTemplate` are exported.
- Compare diffs any version against the open one (or its draft), unified or side by side.

_On `window.CoreloomUIDesignSystem_ff5f32` as `PromptManager`._
