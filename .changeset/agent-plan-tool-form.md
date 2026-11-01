---
'@coreloom/ui': minor
---

### Added

- `AgentPlan` (`@coreloom/agent-plan`): the steps an agent works through, ticked off live (to do,
  in progress, done, failed, skipped) with "2 of 5 done" and a bar. It reads the `data-plan` part
  your stream writes and rewrites with the same `id`. `active` stops the spinner when the agent
  stops; `announce` reads the step in progress out on its own.
- `ToolForm` and `formTool()` (`@coreloom/tool-form`): a tool that asks the person with a form
  (text, email, web address, number, date, choice, checkbox) before it goes on. The answer becomes
  the tool's output; Cancel answers with an error the model reads. The fields can be the app's, or
  written by the model as the tool's input (read defensively with `readToolFormFields`).
- `Chat`, `ChatWidget`, `ChatMessages`, `ChatMessage`: `data-plan` parts show as an `AgentPlan`;
  `renderData(part)` draws your own `data-*` parts; `onToolOutput` takes `addToolOutput` as it is.
- `ToolCall`: `onOutput`, and `awaitsInput` on a `tool` entry. While such a call waits, `render`
  gets `submit(output)` and `cancel(reason?)`, the card says "Waiting for you" and the call isn't
  marked busy.
- `@coreloom/ai`: `AiDataPart`, `AiPlan`, `AiPlanStep`, `isDataPart`, `readPlan` (maps other
  agents' statuses such as `in_progress` and `completed`) and `planProgress`.

### Upgrading

- These read new strings (`ai.plan`, `ai.toolForm`): re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) and `@coreloom/ai` with `--overwrite`
  first, then `@coreloom/tool-call` and `@coreloom/ai-chat`.
