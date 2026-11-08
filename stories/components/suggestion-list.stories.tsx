import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Markdown } from '@/components/ui/markdown'
import { type Suggestion, SuggestionList } from '@/components/ui/suggestion-list'

// Rules a model proposed from a project's notes, waiting for someone to review them.
const RULES: Suggestion[] = [
  {
    id: 'r1',
    label: 'Testing',
    text: 'Write a Playwright spec for every new page, next to the route it covers.',
    detail: 'From your notes on “How do you test?”',
  },
  {
    id: 'r2',
    label: 'TypeScript',
    text: 'Never use `any`: narrow `unknown` instead.',
    detail: 'From your notes on “TypeScript settings”',
  },
  {
    id: 'r3',
    label: 'Git',
    text: 'Write commit messages in English, in the Conventional Commits format.',
  },
]

const LONG: Suggestion[] = [
  {
    id: 'l1',
    label: 'Architecture and boundaries between the packages of the monorepo',
    text: 'Keep the domain code of `packages/uml` free of any import from `apps/web` or `apps/api`: the package is shared by the browser and the server, so anything it imports ends up in both bundles, and a server-only module pulled in by accident breaks the web build in a way that is hard to trace back.',
    detail:
      'From your notes on “Which parts of the code may depend on which?”, answered on the first questionnaire of the project',
  },
]

const markdown = (text: string) => <Markdown inline>{text}</Markdown>

const meta = {
  title: 'Components/Actions/Suggestion list',
  component: SuggestionList,
  tags: ['autodocs'],
  args: {
    suggestions: RULES,
    onAccept: () => {
      // The app saves the text and drops the suggestion here.
    },
    onDismiss: () => {
      // The app drops the suggestion here.
    },
    renderText: markdown,
    editable: true,
    disabled: false,
  },
  argTypes: {
    editable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Suggestions reviewed one by one before they count: rules a model proposed, tags, fixes. Each one is accepted as it is, edited then accepted, or ignored. The app passes `suggestions` (`id`, `text`, and optionally `label` and `detail`), saves in `onAccept(suggestion, text)` and `onDismiss(suggestion)` (a returned promise shows a spinner, and a rejected one keeps the suggestion), and removes each handled suggestion from the list. `renderText` draws the text (inline Markdown here).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SuggestionList>
export default meta
type Story = StoryObj<typeof meta>

/** Wired like an app: what is accepted is listed below, and handled suggestions leave the list. */
function Review({
  initial,
  failOn,
  ...props
}: Partial<React.ComponentProps<typeof SuggestionList>> & {
  initial: Suggestion[]
  /** The id whose first Accept fails, to show what a failed save looks like. */
  failOn?: string
}) {
  const [items, setItems] = React.useState(initial)
  const [kept, setKept] = React.useState<string[]>([])
  const failed = React.useRef(false)
  const drop = (id: string) => {
    setItems((list) => list.filter((s) => s.id !== id))
  }
  return (
    <div className="grid gap-4">
      <SuggestionList
        renderText={markdown}
        {...props}
        suggestions={items}
        onAccept={(suggestion, text) =>
          new Promise<void>((resolve, reject) => {
            window.setTimeout(() => {
              if (suggestion.id === failOn && !failed.current) {
                failed.current = true
                reject(new Error('The server refused it.'))
                return
              }
              setKept((list) => [...list, text])
              drop(suggestion.id)
              resolve()
            }, 300)
          })
        }
        onDismiss={(suggestion) => {
          drop(suggestion.id)
        }}
      />
      <div className="text-[13px] text-muted-foreground">
        <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
          Accepted
        </p>
        {kept.length === 0 ? (
          <p className="m-0">Nothing yet.</p>
        ) : (
          <ul aria-label="Accepted rules" className="m-0 pl-4">
            {kept.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** Three proposed rules, each with its section and where it comes from. */
export const Default: Story = {}

/** Interactive: accept, edit then accept, or ignore; the list shrinks and focus moves on. */
export const Interactive: Story = {
  render: () => <Review initial={RULES} />,
}

/** Nothing left to review. */
export const Empty: Story = { args: { suggestions: [] } }

/** A custom empty message. */
export const CustomEmpty: Story = {
  args: { suggestions: [], empty: 'All proposals reviewed. Generate again to get more.' },
}

/** Without Edit: take it or leave it. */
export const NotEditable: Story = { args: { editable: false } }

/** While the app is busy elsewhere, nothing can be handled. */
export const Disabled: Story = { args: { disabled: true } }

/** Long labels, text and origin wrap. */
export const LongContent: Story = { args: { suggestions: LONG } }

/** The first Accept of the second rule fails: the rule stays, and a second try works. */
export const FailedSave: Story = {
  render: () => <Review initial={RULES} failOn="r2" />,
}

export const French: Story = {
  args: {
    suggestions: [
      {
        id: 'f1',
        label: 'Tests',
        text: 'Écrire un test Playwright pour chaque nouvelle page.',
        detail: 'D’après vos notes sur « Comment testez-vous ? »',
      },
      { id: 'f2', label: 'TypeScript', text: 'Ne jamais utiliser `any`.' },
    ],
  },
  globals: { locale: 'fr' },
}

export const FrenchEmpty: Story = { args: { suggestions: [] }, globals: { locale: 'fr' } }
