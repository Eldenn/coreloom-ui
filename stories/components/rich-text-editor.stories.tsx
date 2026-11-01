import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { userEvent, within } from 'storybook/test'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import {
  type RichTextAiAction,
  type RichTextAiRequest,
  RichTextEditor,
} from '@/components/ui/rich-text-editor'
import { RichTextField } from '@/components/ui/rich-text-field'
import { toast } from '@/components/ui/sonner'
import { Switch } from '@/components/ui/switch'

const sample = `<h2>Release notes</h2><p>This release adds <strong>typed dates</strong>, a <em>server-driven</em> table and a <a href="https://eldenn.github.io/coreloom-ui/">rich text editor</a>.</p><ul><li>Faster builds</li><li>Fewer surprises</li></ul><blockquote><p>Ship small, ship often.</p></blockquote>`

const meta = {
  title: 'Components/Forms/Rich text editor',
  component: RichTextEditor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Formatted text with a Coreloom toolbar; the value is HTML. With `ai`, an AI button and ⌘J / Ctrl+J open a panel that rewrites the selection (or the whole document) through your own `onRequest`, and "/" at the start of a line opens a menu of AI commands (Ask AI…, Continue writing, the quick actions).',
      },
    },
  },
} satisfies Meta<typeof RichTextEditor>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [html, setHtml] = React.useState(sample)
    return (
      <Field className="max-w-2xl">
        <FieldLabel id="notes-label">Release notes</FieldLabel>
        <RichTextEditor value={html} onValueChange={setHtml} aria-labelledby="notes-label" />
        <FieldDescription>
          <span className="font-mono">{html.length}</span> characters of HTML
        </FieldDescription>
      </Field>
    )
  },
}

export const Empty: Story = {
  render: () => (
    <Field className="max-w-2xl">
      <FieldLabel id="empty-label">Comment</FieldLabel>
      <RichTextEditor aria-labelledby="empty-label" minHeight={100} />
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-2xl">
      <FieldLabel id="disabled-label">Archived notes</FieldLabel>
      <RichTextEditor defaultValue={sample} disabled aria-labelledby="disabled-label" />
    </Field>
  ),
}

/** Submit empty to see the error; the value is HTML, checked here for real text. */
export const InAForm: Story = {
  name: 'In a form (TanStack)',
  render: () => {
    const form = useAppForm({
      defaultValues: { body: '' },
      validators: {
        onChange: z.object({
          body: z
            .string()
            .refine(
              (html) => html.replace(/<[^>]+>/g, '').trim().length >= 10,
              'Write at least 10 characters.',
            ),
        }),
      },
      onSubmit: async () => {
        await new Promise((r) => setTimeout(r, 500))
        toast.success('Posted')
      },
    })
    return (
      <form
        noValidate
        className="max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-5">
          <form.AppField name="body">
            {() => (
              <RichTextField
                label="Description"
                description="Markdown shortcuts work: ## for a heading, - for a list."
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton className="self-start" pendingLabel="Posting…">
              Post
            </form.SubmitButton>
          </form.AppForm>
        </FieldGroup>
      </form>
    )
  },
}

// ——— AI. The model is faked here: canned answers, streamed word by word. In an app, onRequest
// calls your server (AI SDK streamText → textStream, or fetch) and passes `signal` along.

const draft = `<p>our new release make the build faster and it also fix a lot of small bugs that people was reporting since last month.</p><p>Thanks to everyone who tested <a href="https://eldenn.github.io/coreloom-ui/">the beta</a> — <s>three</s> four weeks of it.</p>`

const CANNED: Record<RichTextAiAction, string> = {
  improve:
    'Our new release makes builds **faster** and fixes the small bugs you reported over the past month.',
  fixGrammar: '',
  shorten: "Faster builds, and last month's reported bugs fixed.",
  lengthen:
    'Our new release makes builds noticeably faster. It also fixes a long list of small bugs that you reported over the past month:\n\n- flaky date pickers\n- toasts stacking off screen\n- a focus ring that went missing in dark mode',
  summarise: '**In short:** faster builds and many small fixes.',
  continue:
    'Next up: the same speed-up for the test runner, and a **dark mode** audit of every chart.',
  translate: '',
  custom: '',
}
const TRANSLATIONS: Record<string, string> = {
  fr: 'Notre nouvelle version accélère les builds et corrige les petits bugs signalés le mois dernier.',
  es: 'Nuestra nueva versión acelera las compilaciones y corrige los pequeños errores del mes pasado.',
  de: 'Unsere neue Version beschleunigt Builds und behebt die kleinen Fehler aus dem letzten Monat.',
  en: "Our new release makes builds faster and fixes last month's small bugs.",
}

// Fixes this draft's mistakes in the text it receives, so links and other marks make the round trip.
const FIXES: [string, string][] = [
  ['make the build', 'makes the build'],
  ['it also fix ', 'it also fixes '],
  ['people was', 'people were'],
  ['Thanks to everyone', 'Thank you to everyone'],
]
const fixGrammar = (text: string) => FIXES.reduce((t, [from, to]) => t.replace(from, to), text)

function cannedAnswer(request: Pick<RichTextAiRequest, 'action' | 'prompt' | 'language' | 'text'>) {
  if (request.action === 'fixGrammar') return fixGrammar(request.text)
  if (request.action === 'translate')
    return TRANSLATIONS[request.language ?? 'en'] ?? TRANSLATIONS.en
  if (request.action === 'custom')
    return `## ${request.prompt}\n\nHere is a first draft, to edit as you like:\n\n1. Say what changed.\n2. Say why it matters.\n3. Thank the testers.`
  return CANNED[request.action]
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- rejects with the abort reason, as fetch does.
        reject(signal.reason)
      },
      { once: true },
    )
  })

/** A fake model: the canned answer, one word every 45 ms, stopping when the signal aborts. It
 *  "thinks" for 1.5 s first, so a test on a busy machine can press Stop before any text. */
async function* fakeStream(request: RichTextAiRequest) {
  await wait(1500, request.signal)
  for (const word of cannedAnswer(request).split(/(?<=\s)/)) {
    await wait(45, request.signal)
    yield word
  }
}

/** Select a sentence and press ⌘J / Ctrl+J (or the AI button), then pick a quick action or type an instruction. */
export const WithAi: Story = {
  name: 'With AI',
  render: () => {
    const [html, setHtml] = React.useState(draft)
    const [last, setLast] = React.useState<RichTextAiRequest | null>(null)
    return (
      <Field className="max-w-2xl">
        <FieldLabel id="ai-label">Announcement</FieldLabel>
        <RichTextEditor
          value={html}
          onValueChange={setHtml}
          aria-labelledby="ai-label"
          ai={{
            onRequest: (request) => {
              setLast(request)
              return fakeStream(request)
            },
          }}
        />
        <FieldDescription data-testid="ai-last-request">
          {last
            ? `Last request: ${last.action}${last.language ? ` (${last.language})` : ''} on the ${last.scope}, ${last.text.length} characters.`
            : 'Select text, then press ⌘J or Ctrl+J.'}
        </FieldDescription>
      </Field>
    )
  },
}

/** The panel open on a finished suggestion (the whole document, improved). */
export const AiPanelOpen: Story = {
  name: 'AI panel, suggestion ready',
  tags: ['!autodocs'],
  render: () => (
    <div className="min-h-[560px]">
      <Field className="max-w-2xl">
        <FieldLabel id="ai-open-label">Announcement</FieldLabel>
        <RichTextEditor
          defaultValue={draft}
          aria-labelledby="ai-open-label"
          minHeight={100}
          ai={{
            onRequest: (request) => Promise.resolve(cannedAnswer(request)),
            defaultOpen: { action: 'improve' },
          }}
        />
      </Field>
    </div>
  ),
}

/** The request failed: the error shows in the panel with Retry. A thrown Error's message is shown under the generic text. */
export const AiError: Story = {
  name: 'AI error',
  tags: ['!autodocs'],
  render: () => (
    <div className="min-h-[480px]">
      <Field className="max-w-2xl">
        <FieldLabel id="ai-error-label">Announcement</FieldLabel>
        <RichTextEditor
          defaultValue={draft}
          aria-labelledby="ai-error-label"
          minHeight={100}
          ai={{
            onRequest: async () =>
              Promise.reject(new Error('The model is busy. Try again in a minute.')),
            defaultOpen: { action: 'improve' },
          }}
        />
      </Field>
    </div>
  ),
}

/** The panel in French: quick actions, languages named in French. */
export const AiPanelFrench: Story = {
  name: 'AI panel (French)',
  tags: ['!autodocs'],
  globals: { locale: 'fr' },
  render: () => (
    <div className="min-h-[560px]">
      <Field className="max-w-2xl">
        <FieldLabel id="ai-fr-label">Annonce</FieldLabel>
        <RichTextEditor
          defaultValue={draft}
          aria-labelledby="ai-fr-label"
          minHeight={100}
          ai={{ onRequest: (request) => Promise.resolve(cannedAnswer(request)), defaultOpen: true }}
        />
      </Field>
    </div>
  ),
}

/** `ai` can be turned on after the editor mounts: the AI button and ⌘J / Ctrl+J appear, and the panel still sees the selection. */
export const AiAddedLater: Story = {
  name: 'AI turned on later',
  tags: ['!autodocs'],
  render: () => {
    const [enabled, setEnabled] = React.useState(false)
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- the label wraps the Switch, a <button> (a labelable element). */}
        <label className="flex items-center gap-2 text-[14px] text-foreground">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          Writing help
        </label>
        <Field>
          <FieldLabel id="ai-later-label">Announcement</FieldLabel>
          <RichTextEditor
            defaultValue={draft}
            aria-labelledby="ai-later-label"
            minHeight={100}
            ai={enabled ? { onRequest: fakeStream } : undefined}
          />
        </Field>
      </div>
    )
  },
}

// ——— The "/" menu.

const slashDraft = `${draft}<p></p>`

/** Type "/" on the empty last line (or after a space): pick Ask AI…, Continue writing or a quick action with the arrows and Enter, or keep typing to filter ("/sum"). Escape keeps the text as typed. */
export const SlashCommand: Story = {
  name: 'Slash command',
  render: () => {
    const [html, setHtml] = React.useState(slashDraft)
    const [last, setLast] = React.useState<RichTextAiRequest | null>(null)
    return (
      <div className="min-h-[560px]">
        <Field className="max-w-2xl">
          <FieldLabel id="slash-label">Announcement</FieldLabel>
          <RichTextEditor
            value={html}
            onValueChange={setHtml}
            aria-labelledby="slash-label"
            ai={{
              onRequest: (request) => {
                setLast(request)
                return fakeStream(request)
              },
            }}
          />
          <FieldDescription data-testid="slash-last-request">
            {last
              ? `Last request: ${last.action} on the ${last.scope}, ${last.text.length} characters.`
              : 'Type / on the empty last line.'}
          </FieldDescription>
        </Field>
      </div>
    )
  },
}

/** The "/" menu open on an empty line, every command listed, the first one highlighted. */
export const SlashMenuOpen: Story = {
  name: 'Slash menu open',
  tags: ['!autodocs'],
  render: () => (
    <div className="min-h-[480px]">
      <Field className="max-w-2xl">
        <FieldLabel id="slash-open-label">Announcement</FieldLabel>
        <RichTextEditor
          defaultValue={slashDraft}
          aria-labelledby="slash-open-label"
          minHeight={100}
          ai={{ onRequest: (request) => Promise.resolve(cannedAnswer(request)) }}
        />
      </Field>
    </div>
  ),
  // Puts the caret on the empty last line and types "/", as a person would.
  play: async ({ canvasElement }) => {
    const editor = await within(canvasElement).findByRole('textbox', { name: 'Announcement' })
    const line = editor.querySelector('p:last-child')
    if (line) await userEvent.click(line)
    await userEvent.keyboard('/')
  },
}

/** The editor inside a modal Dialog: the "/" menu takes clicks, and Escape closes the menu first, then the dialog. */
export const SlashInDialog: Story = {
  name: 'Slash command in a dialog',
  tags: ['!autodocs'],
  render: () => {
    const [html, setHtml] = React.useState(slashDraft)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit announcement</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit announcement</DialogTitle>
            <DialogDescription>Type / on the empty last line for AI commands.</DialogDescription>
          </DialogHeader>
          <RichTextEditor
            value={html}
            onValueChange={setHtml}
            aria-label="Announcement"
            minHeight={100}
            ai={{ onRequest: (request) => Promise.resolve(cannedAnswer(request)) }}
          />
        </DialogContent>
      </Dialog>
    )
  },
}

const earlier = [
  'Typed dates in every date field',
  'A server-driven data table',
  'Spanish and German',
  'Accent presets',
  'The Kanban block',
  'Notifications in the header',
]

/** The editor in a panel that scrolls: the "/" menu follows the slash as the panel scrolls, and closes once the slash leaves the panel's view. */
export const SlashInScrollingPanel: Story = {
  name: 'Slash command in a scrolling panel',
  tags: ['!autodocs'],
  render: () => {
    const [html, setHtml] = React.useState(slashDraft)
    return (
      <section
        aria-label="Announcement panel"
        className="max-w-2xl rounded-lg border border-border bg-card"
      >
        <div className="h-[300px] overflow-y-auto p-4" data-testid="scrolling-panel">
          <Field>
            <FieldLabel id="slash-panel-label">Announcement</FieldLabel>
            <RichTextEditor
              value={html}
              onValueChange={setHtml}
              aria-labelledby="slash-panel-label"
              minHeight={100}
              ai={{ onRequest: (request) => Promise.resolve(cannedAnswer(request)) }}
            />
          </Field>
          <p className="mt-6 mb-2 text-[13px] font-medium text-foreground">Earlier announcements</p>
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            {earlier.map((title) => (
              <li key={title} className="rounded-md border border-border-subtle px-3 py-2">
                {title}
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  },
}

// ——— Review changes: a rewrite shown as a diff in the text, accepted or rejected change by change.

const reviewDraft = `<p>our new release make the build faster and it also fix a lot of small bugs that people was reporting since last month.</p><p>Thanks to everyone who tested <a href="https://eldenn.github.io/coreloom-ui/">the beta</a> — <s>three</s> four weeks of it.</p>`

const plainText = (html: string) => html.replace(/<[^>]+>/g, '')

function ReviewEditor({ label }: { label: string }) {
  const [html, setHtml] = React.useState(reviewDraft)
  const id = React.useId()
  return (
    <div className="min-h-[360px]">
      <Field className="max-w-2xl">
        <FieldLabel id={id}>{label}</FieldLabel>
        <RichTextEditor
          value={html}
          onValueChange={setHtml}
          aria-labelledby={id}
          minHeight={100}
          ai={{
            onRequest: (request) => Promise.resolve(cannedAnswer(request)),
            defaultOpen: { action: 'fixGrammar' },
          }}
        />
        <FieldDescription data-testid="review-value">
          {/* Text only: the editor normalises the HTML (link attributes) as it loads. */}
          {plainText(html) === plainText(reviewDraft)
            ? 'The value stays as it is until you accept a change.'
            : 'The value now has the changes you accepted.'}
        </FieldDescription>
      </Field>
    </div>
  )
}

// Runs "Fix spelling and grammar" on the whole draft and presses Review changes, as a person would.
const startReviewPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const review = await within(canvasElement.ownerDocument.body).findByRole('button', {
    name: /^(Review changes|Revoir les modifications)$/,
  })
  await userEvent.click(review)
}

/** "Review changes" after a rewrite: each change is drawn in the text (struck through, then underlined), and the bar under it steps through them — Accept, Reject, or all at once. The value only changes as changes are accepted. */
export const ReviewChanges: Story = {
  name: 'AI suggestions to review',
  render: () => <ReviewEditor label="Announcement" />,
  play: startReviewPlay,
}

export const ReviewChangesFrench: Story = {
  name: 'AI suggestions to review (French)',
  tags: ['!autodocs'],
  globals: { locale: 'fr' },
  render: () => <ReviewEditor label="Annonce" />,
  play: startReviewPlay,
}
