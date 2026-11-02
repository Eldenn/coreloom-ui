import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { type CommentData, CommentThread } from '@/components/ui/comment-thread'
import type { MentionOption } from '@/components/ui/mention-textarea'

// The screenshots freeze the clock at this moment; the stories count from it too.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const team: MentionOption[] = [
  { value: 'lea', label: 'Léa Martin' },
  { value: 'tom', label: 'Tom Bernard' },
  { value: 'sami', label: 'Sami Haddad' },
]

const me = { name: 'Inès Morel' }

const start: CommentData[] = [
  {
    id: 'c1',
    author: { name: 'Léa Martin' },
    body: 'The new onboarding is much clearer. @tom can we ship it to 10% of new sign-ups first?',
    createdAt: ago(60 * 5),
    reactions: [
      { emoji: '👍', count: 3, reacted: true },
      { emoji: '🎉', count: 1 },
    ],
    replies: [
      {
        id: 'c1r1',
        author: { name: 'Tom Bernard' },
        body: 'Yes. Flag is ready, I’ll turn it on after the 2 pm deploy.',
        createdAt: ago(60 * 4),
      },
      {
        id: 'c1r2',
        author: { name: 'Sami Haddad' },
        body: 'I’ll watch the activation funnel tomorrow morning.',
        createdAt: ago(60 * 3),
        edited: true,
      },
    ],
  },
  {
    id: 'c2',
    author: { name: 'Sami Haddad' },
    body: 'Step 3 still says “workspace” where the rest says “team”.',
    createdAt: ago(25),
  },
]

function Demo({ initial }: { initial: CommentData[] }) {
  const [comments, setComments] = React.useState(initial)
  const count = React.useRef(0)
  return (
    <CommentThread
      className="max-w-xl"
      comments={comments}
      currentUser={me}
      mentionables={team}
      now={NOW}
      onSubmit={(text, parentId) => {
        count.current += 1
        const comment: CommentData = {
          id: `new-${String(count.current)}`,
          author: me,
          body: text,
          createdAt: NOW,
        }
        setComments((list) =>
          parentId
            ? list.map((c) =>
                c.id === parentId ? { ...c, replies: [...(c.replies ?? []), comment] } : c,
              )
            : [...list, comment],
        )
      }}
      onReact={(id, emoji) => {
        const toggle = (c: CommentData): CommentData => {
          if (c.id !== id) return { ...c, replies: c.replies?.map(toggle) }
          const reactions = c.reactions ?? []
          const found = reactions.find((r) => r.emoji === emoji)
          const updated = found
            ? reactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + (r.reacted ? -1 : 1), reacted: !r.reacted }
                    : r,
                )
                .filter((r) => r.count > 0)
            : [...reactions, { emoji, count: 1, reacted: true }]
          return { ...c, reactions: updated }
        }
        setComments((list) => list.map(toggle))
      }}
    />
  )
}

const meta = {
  title: 'Components/Data display/Comment thread',
  component: CommentThread,
  tags: ['autodocs'],
  args: { comments: start },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A discussion: comments, one level of replies, reactions and "@" mentions. The consumer provides `comments`, and optionally `onSubmit(text, parentId?)`, `onReact(id, emoji)`, `currentUser`, `mentionables` and `collapseRepliesAfter`. Without `onSubmit` it is read only.',
      },
    },
  },
} satisfies Meta<typeof CommentThread>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Demo initial={start} />,
}

export const ReadOnly: Story = {
  render: () => (
    <CommentThread className="max-w-xl" comments={start} mentionables={team} now={NOW} />
  ),
}
