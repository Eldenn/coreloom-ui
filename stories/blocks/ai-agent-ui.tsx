// Demo data for the agent plan and tool form stories: the plans a server would stream as
// `data-plan` parts, and the tools that ask the person with a form (`formTool`). App code, so the
// strings live here, in the locale the model would answer in.
import type { ToolComponents } from '@/components/ui/tool-call'
import { formTool, type ToolFormField, type ToolFormValues } from '@/components/ui/tool-form'
import type { AiPlan, AiPlanStep } from '@/lib/ai'

const steps = {
  en: [
    'Read the last three build logs',
    'Find the change that broke the type check',
    'Rename `slug` to `handle` in settings.tsx',
    'Run the type check',
    'Open a pull request',
  ],
  fr: [
    'Lire les journaux des trois derniers builds',
    'Trouver le changement qui casse la vérification des types',
    'Renommer `slug` en `handle` dans settings.tsx',
    'Lancer la vérification des types',
    'Ouvrir une pull request',
  ],
}

/** The plan with `done` steps finished and the next one running (all done when `done` is 5). */
export function deployPlan(done: number, locale: 'en' | 'fr' = 'en'): AiPlan {
  return {
    title: locale === 'fr' ? 'Réparer les déploiements' : 'Fix the failing deploys',
    steps: steps[locale].map((title, i): AiPlanStep => ({
      id: String(i + 1),
      title,
      status: i < done ? 'done' : i === done ? 'running' : 'pending',
      ...(i === 0 && done > 0
        ? {
            detail:
              locale === 'fr' ? 'Les trois échouent sur TS2339.' : 'All three fail on TS2339.',
          }
        : {}),
    })),
  }
}

export const failedPlan: AiPlan = {
  title: 'Roll back production',
  steps: [
    { id: '1', title: 'Find the last green build', status: 'done', detail: 'dpl_5t3q, 2 days ago' },
    { id: '2', title: 'Check the database migrations', status: 'skipped' },
    {
      id: '3',
      title: 'Promote dpl_5t3q to production',
      status: 'failed',
      detail: 'Deployment protection requires an approval from an owner.',
    },
    { id: '4', title: 'Tell the team in #releases', status: 'pending' },
  ],
}

export const longPlan: AiPlan = {
  title: 'Migrate the billing workspace to the new pricing and keep every invoice reachable',
  steps: Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    title:
      i === 4
        ? 'Recalculate the prorated amounts for every subscription that changed plan in the middle of a billing period, including the ones paused by support'
        : `Step ${String(i + 1)}: update the ${['customers', 'plans', 'coupons', 'invoices'][i % 4] ?? ''} table`,
    status: i < 6 ? 'done' : i === 6 ? 'running' : 'pending',
  })),
}

// The tools as the AI SDK infers them (`InferUITools<typeof tools>`). Neither has an `execute`
// on the server: they wait for the browser's answer (`addToolOutput`).
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- a type alias, like the SDK's UITools
export type AgentTools = {
  scheduleCall: { input: { topic: string }; output: ToolFormValues }
  askUser: {
    input: { title?: string; description?: string; fields: unknown[] }
    output: ToolFormValues
  }
}

const callFields = {
  en: [
    { name: 'day', label: 'Day', type: 'date', required: true, min: '2026-10-15' },
    {
      name: 'time',
      label: 'Time',
      type: 'select',
      required: true,
      options: [
        { value: '09:30', label: '9:30 AM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '16:30', label: '4:30 PM' },
      ],
    },
    { name: 'guests', label: 'People from your team', type: 'number', min: 1, max: 8 },
    {
      name: 'notes',
      label: 'Anything to prepare?',
      type: 'textarea',
      description: 'Shared with everyone invited.',
    },
    { name: 'remind', label: 'Remind me 10 minutes before', type: 'checkbox', defaultValue: true },
  ],
  fr: [
    { name: 'day', label: 'Jour', type: 'date', required: true, min: '2026-10-15' },
    {
      name: 'time',
      label: 'Heure',
      type: 'select',
      required: true,
      options: [
        { value: '09:30', label: '9 h 30' },
        { value: '14:00', label: '14 h' },
        { value: '16:30', label: '16 h 30' },
      ],
    },
    { name: 'guests', label: 'Personnes de votre équipe', type: 'number', min: 1, max: 8 },
    {
      name: 'notes',
      label: 'Quelque chose à préparer ?',
      type: 'textarea',
      description: 'Partagé avec toutes les personnes invitées.',
    },
    {
      name: 'remind',
      label: 'Me le rappeler 10 minutes avant',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
} satisfies Record<'en' | 'fr', ToolFormField[]>

/** The map an app passes to `Chat`: a form the app wrote, and one the model writes. */
export function agentTools(
  locale: 'en' | 'fr' = 'en',
  display: 'card' | 'inline' = 'inline',
): ToolComponents<AgentTools> {
  return {
    scheduleCall: formTool<AgentTools['scheduleCall']['input']>({
      label: locale === 'fr' ? 'Planifier un appel' : 'Schedule a call',
      display,
      fields: callFields[locale],
      title: (input) =>
        locale === 'fr'
          ? `Quand faire l’appel « ${input.topic} » ?`
          : `When should we talk about “${input.topic}”?`,
      submitLabel: locale === 'fr' ? 'Planifier' : 'Schedule',
    }),
    askUser: formTool({
      label: locale === 'fr' ? 'Question de l’agent' : 'Question from the agent',
    }),
  }
}

/** What a model sends to `askUser`: the form, written by the model. */
export const askUserInput: AgentTools['askUser']['input'] = {
  title: 'Who should get the release notes?',
  description: 'I’ll send them once the deploy is green.',
  fields: [
    {
      name: 'audience',
      label: 'Audience',
      type: 'select',
      required: true,
      options: ['Team', 'Customers', 'Everyone'],
    },
    { name: 'email', label: 'Reply-to address', type: 'email', placeholder: 'ana@example.com' },
  ],
}
