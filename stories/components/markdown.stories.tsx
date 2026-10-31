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

/**
 * With `sources`, the model's "[1]" markers become citations that show the source on hover, focus or tap.
 * In code (`items[1]`) and links they stay as written; "[4]" has no source here, so it stays text too. Escaped
 * markers and indexes (`x[2]`) aren't citations, and a definition the model wrote (`[1]: https://…`) can't
 * turn "[1]" into a link.
 */
export const WithSources: Story = {
  args: {
    children:
      "Rolling back replaces what's live with the last green build [1], and the old one stays available for a week [1][2].\n\nIn a script, read `deployments[1]` for the previous build — see the [CLI reference](https://coreloom.dev/docs/cli) [3]. A footnote like [4] without a source stays plain text, and so do an escaped \\[2\\] and an index like x[2].\n\n[1]: https://evil.example/written-by-the-model",
    sources: [
      { type: "source-url", sourceId: "s1", url: "https://coreloom.dev/docs/deployments", title: "Deployments guide" },
      { type: "source-url", sourceId: "s2", url: "https://coreloom.dev/docs/retention", title: "Retention of builds" },
      { type: "source-document", sourceId: "d1", title: "Runbook — rollbacks", filename: "rollbacks.pdf", mediaType: "application/pdf" },
    ],
  },
}

/**
 * Footnotes ([^1]) jump within the answer and are labelled in the reader's language. A code block whose
 * lines don't fit scrolls sideways and takes focus (so the keyboard can scroll it); one that fits doesn't.
 */
export const FootnotesAndLongCode: Story = {
  args: {
    children: `Pin the build after a rollback[^pin], or the next push replaces it.[^push]

\`\`\`bash
coreloom rollback coreloom-api --to dpl_5t3q --pin --reason "TS2339 in settings.tsx after the Workspace.slug rename" --notify "#incidents"
\`\`\`

\`\`\`bash
coreloom builds ls
\`\`\`

[^pin]: Pinning keeps the build live until you unpin it.
[^push]: Every push to \`main\` deploys, unless a build is pinned.`,
  },
}
