import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Markdown } from "@/components/ui/markdown";
import { PromptInput } from "@/components/ui/prompt-input";
import { Reasoning } from "@/components/ui/reasoning";
import { ToolCall } from "@/components/ui/tool-call";
import { Badge } from "@/components/ui/badge";
import type { AiChatStatus, AiToolPart } from "@/lib/ai";

const meta = {
  title: "Components/AI",
  component: PromptInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The pieces the AI blocks are made of, usable on their own: `PromptInput` (the composer), `Markdown` (model output), `Reasoning` (folded thinking) and `ToolCall` (one tool invocation with its input, output and approval). They read the AI SDK's message parts as they are.",
      },
    },
  },
  args: { onSubmit: () => {} },
} satisfies Meta<typeof PromptInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Enter sends, Shift + Enter breaks the line. While a reply streams, Send becomes Stop. */
export const Prompt: Story = {
  render: () => {
    const [status, setStatus] = React.useState<AiChatStatus>("ready");
    const [sent, setSent] = React.useState<string[]>([]);
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <PromptInput
          status={status}
          allowAttachments
          onStop={() => setStatus("ready")}
          onSubmit={({ text }) => {
            setSent((s) => [...s, text]);
            setStatus("streaming");
          }}
          toolbar={<Badge variant="secondary">Claude Sonnet</Badge>}
        />
        <ul
          aria-label="Sent"
          className="m-0 list-none p-0 text-[13px] text-muted-foreground"
        >
          {sent.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    );
  },
};

const sample = `## Rolling back

Roll back when **production is down** and a fix will take longer than a few minutes.

1. Find the last green deployment.
2. Check its branch still exists.
3. Run the rollback and watch the error rate.

| Step | Owner |
|---|---|
| Decide | On-call |
| Roll back | On-call |
| Postmortem | Team |

\`\`\`bash
coreloom rollback coreloom-api --to dpl_5t3q
\`\`\`

- [x] Status page updated
- [ ] Postmortem scheduled

See the [runbook](https://coreloom.dev/runbooks/rollback) for the details. Inline \`code\` and ~~old advice~~ render too.`;

export const MarkdownStory: Story = {
  name: "Markdown",
  render: () => (
    <div className="max-w-2xl">
      <Markdown>{sample}</Markdown>
    </div>
  ),
};

export const ReasoningStory: Story = {
  name: "Reasoning",
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <Reasoning
        text="The user wants to know why the build failed. Check the latest failed deployment first, then its logs."
        streaming
      />
      <Reasoning
        text="Checked the logs: a type error in settings.tsx."
        duration={6}
      />
    </div>
  ),
};

/** Every state a tool call goes through; the approval one asks before running. */
export const ToolCalls: Story = {
  render: () => {
    const [rollback, setRollback] = React.useState<AiToolPart>({
      type: "tool-rollback",
      toolCallId: "3",
      state: "approval-requested",
      input: { deployment: "dpl_5t3q" },
      approval: { id: "a1" },
    });
    return (
      <div className="flex max-w-2xl flex-col gap-2">
        <ToolCall
          part={{
            type: "tool-searchDocs",
            toolCallId: "1",
            state: "input-available",
            input: { query: "rollback" },
          }}
          label="Search the docs"
        />
        <ToolCall
          part={{
            type: "tool-searchDeployments",
            toolCallId: "2",
            state: "output-available",
            input: { project: "coreloom-api" },
            output: { id: "dpl_8f2k", status: "failed" },
          }}
        />
        <ToolCall
          part={rollback}
          label="Roll back production"
          onApprovalResponse={({ approved }) =>
            setRollback((p) =>
              approved
                ? {
                    ...p,
                    state: "output-available",
                    approval: { id: "a1", approved },
                    output: { status: "rolled back" },
                  }
                : {
                    ...p,
                    state: "output-denied",
                    approval: { id: "a1", approved },
                  },
            )
          }
        />
        <ToolCall
          part={{
            type: "dynamic-tool",
            toolName: "sendEmail",
            toolCallId: "4",
            state: "output-error",
            input: { to: "ops@acme.dev" },
            errorText: "SMTP timeout after 10 s.",
          }}
        />
        <ToolCall
          part={{
            type: "tool-createTicket",
            toolCallId: "5",
            state: "output-denied",
            input: { title: "Rollback" },
            approval: { id: "a2", approved: false },
          }}
        />
      </div>
    );
  },
};
