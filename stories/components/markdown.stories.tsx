import type { Meta, StoryObj } from "@storybook/react-vite"

import { Markdown } from "@/components/ui/markdown"

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

> Tell #incidents before you start.

- [x] Status page updated
- [ ] Postmortem scheduled

See the [runbook](https://coreloom.dev/runbooks/rollback) for the details. Inline \`code\` and ~~old advice~~ render too.`

const meta = {
  title: "Components/AI/Markdown",
  component: Markdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A model's answer, rendered: GitHub-flavoured Markdown with tables, task lists and code blocks that copy. Raw HTML is skipped — model output is untrusted.",
      },
    },
  },
  args: { children: sample, streaming: false },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof Markdown>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** While the answer arrives: a caret follows the last character. */
export const Streaming: Story = {
  args: {
    streaming: true,
    children: "The build stopped on a **type error**: `Workspace.slug` was renamed to",
  },
}

/** HTML in the text is dropped, not rendered. */
export const UntrustedHtml: Story = {
  args: {
    children: 'Here is the fix. <img src=x onerror="alert(1)"> <b>Bold?</b> Only **Markdown** formats.',
  },
}
