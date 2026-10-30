# AI Agents

Managing AI agents: `AgentList`, cards with each agent's status, model, tools and recent activity; and `AgentEditor`, the settings of one agent — identity, instructions, model, temperature, step limit, tools and the knowledge it can search.

**`AgentList` takes** `agents` (id, name, description, status, model, toolCount, lastRunAt, runsThisWeek) and `href(id)`, plus optionally `onNew` and `now`.

**`AgentEditor` takes** `defaultValues`, `models`, `tools` (id, name, description, `sensitive`), `knowledgeBases` and `onSubmit(values)`; values are `name`, `description`, `instructions`, `model`, `temperature`, `maxSteps`, `tools`, `askFirst` and `knowledge`.

- Built on the form system: a name and instructions are required, errors show on blur and on submit, Save shows progress.
- `{{variables}}` in the instructions are listed under the field, so people see what the agent expects to be filled in.
- Each tool has "Ask first": a sensitive tool turns it on when enabled, so the agent asks before acting.
- Status is a badge with text (Active, Paused, Draft), never colour alone.
- Keep secrets (API keys, tokens) out of instructions; they belong in the server's configuration.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ai-agents`.
