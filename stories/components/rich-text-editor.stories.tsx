import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { z } from 'zod'

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
          'Formatted text with a Coreloom toolbar; the value is HTML. With `ai`, an AI button and ⌘J / Ctrl+J open a panel that rewrites the selection (or the whole document) through your own `onRequest`.',
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
        reject(signal.reason)
      },
      { once: true },
    )
  })

/** A fake model: the canned answer, one word every 45 ms, stopping when the signal aborts. */
async function* fakeStream(request: RichTextAiRequest) {
  await wait(600, request.signal)
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
            onRequest: async (request) => cannedAnswer(request),
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
          ai={{ onRequest: async (request) => cannedAnswer(request), defaultOpen: true }}
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
