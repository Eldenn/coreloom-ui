// Demo forms for the FormRenderer and FormBuilder stories.
import type { FormSpec } from '@/components/ui/form-renderer'

export const demoSpec: FormSpec = {
  version: 1,
  title: 'Request a demo',
  description: 'Tell us a little about you and we’ll set up a workspace for your team.',
  submitLabel: 'Send request',
  sections: [
    {
      id: 'you',
      title: 'You',
      columns: 2,
      fields: [
        { name: 'name', type: 'text', label: 'Full name', required: true, maxLength: 80 },
        { name: 'email', type: 'email', label: 'Work email', required: true },
        {
          name: 'phone',
          type: 'phone',
          label: 'Phone',
          defaultCountry: 'FR',
          description: 'Only if you’d like a call.',
        },
        {
          name: 'role',
          type: 'select',
          label: 'Role',
          placeholder: 'Choose a role',
          options: [
            { value: 'eng', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'product', label: 'Product' },
            { value: 'other', label: 'Other' },
          ],
        },
      ],
    },
    {
      id: 'team',
      title: 'Your team',
      columns: 2,
      fields: [
        {
          name: 'kind',
          type: 'radio',
          label: 'Who is it for?',
          required: true,
          defaultValue: 'company',
          options: [
            { value: 'me', label: 'Just me' },
            { value: 'company', label: 'A company' },
          ],
        },
        {
          name: 'company',
          type: 'text',
          label: 'Company',
          required: true,
          visibleWhen: { field: 'kind', op: 'equals', value: 'company' },
        },
        {
          name: 'seats',
          type: 'number',
          label: 'Seats',
          min: 1,
          max: 500,
          defaultValue: 5,
          visibleWhen: { field: 'kind', op: 'equals', value: 'company' },
        },
        { name: 'start', type: 'date', label: 'Start on', min: '2026-11-02' },
      ],
    },
    {
      id: 'details',
      title: 'Details',
      fields: [
        {
          name: 'topics',
          type: 'multiselect',
          label: 'What would you like to see?',
          placeholder: 'Pick topics',
          options: [
            { value: 'forms', label: 'Forms' },
            { value: 'charts', label: 'Charts' },
            { value: 'ai', label: 'AI blocks' },
            { value: 'workflow', label: 'Workflow builder' },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          label: 'Anything else?',
          maxCount: 500,
          maxLength: 500,
        },
        {
          name: 'terms',
          type: 'checkbox',
          label: 'I agree to be contacted about this request',
          required: true,
        },
      ],
    },
  ],
}

/** A JSON Schema and a UI schema (react-jsonschema-form style), as an API might send them. */
export const demoSchema = {
  title: 'Support ticket',
  type: 'object',
  required: ['subject', 'severity'],
  properties: {
    subject: { type: 'string', title: 'Subject', maxLength: 120 },
    severity: {
      type: 'string',
      title: 'Severity',
      oneOf: [
        { const: 'low', title: 'Low' },
        { const: 'high', title: 'High' },
        { const: 'down', title: 'Production is down' },
      ],
    },
    contact: { type: 'string', format: 'email', title: 'Reply to' },
    since: { type: 'string', format: 'date-time', title: 'Since when?' },
    notify: { type: 'boolean', title: 'Email me updates', default: true },
  },
}

export const demoUiSchema = {
  'ui:order': ['subject', 'severity', '*'],
  severity: { 'ui:widget': 'radio' },
  notify: { 'ui:widget': 'switch' },
}

/** One field of each type added with the input primitives (lot 3 to 5). */
export const moreFieldsSpec: FormSpec = {
  version: 1,
  title: 'Event settings',
  sections: [
    {
      id: 'basics',
      title: 'Basics',
      columns: 2,
      fields: [
        { name: 'iban', type: 'masked', label: 'IBAN', preset: 'iban' },
        { name: 'color', type: 'color', label: 'Brand color', defaultValue: '#0ea5e9' },
        { name: 'size', type: 'unit', label: 'Weight', units: ['kg', 'g'] },
        { name: 'length', type: 'duration', label: 'Length' },
        { name: 'month', type: 'month', label: 'Billing month' },
        { name: 'week', type: 'week', label: 'Sprint week' },
        { name: 'hours', type: 'timerange', label: 'Opening hours' },
        { name: 'tz', type: 'timezone', label: 'Time zone', defaultValue: 'Europe/Paris' },
        { name: 'budget', type: 'numberrange', label: 'Budget', min: 0 },
        { name: 'volume', type: 'slider', label: 'Volume', min: 0, max: 100, defaultValue: 40 },
      ],
    },
    {
      id: 'choices',
      title: 'Choices',
      columns: 2,
      fields: [
        {
          name: 'billing',
          type: 'segmented',
          label: 'Billing',
          defaultValue: 'monthly',
          options: [
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ],
        },
        {
          name: 'days',
          type: 'checkboxes',
          label: 'Days',
          options: [
            { value: 'mon', label: 'Monday' },
            { value: 'tue', label: 'Tuesday' },
            { value: 'wed', label: 'Wednesday' },
          ],
        },
        {
          name: 'plan',
          type: 'radiocards',
          label: 'Plan',
          span: 2,
          orientation: 'horizontal',
          options: [
            { value: 'free', label: 'Free', description: 'Up to 3 people' },
            { value: 'team', label: 'Team', description: 'Unlimited people' },
          ],
        },
        {
          name: 'tags',
          type: 'chips',
          label: 'Topics',
          options: [
            { value: 'design', label: 'Design' },
            { value: 'code', label: 'Code' },
            { value: 'ops', label: 'Ops' },
          ],
        },
        {
          name: 'team',
          type: 'treeselect',
          label: 'Team',
          placeholder: 'Choose a team',
          options: [
            {
              value: 'eng',
              label: 'Engineering',
              children: [
                { value: 'web', label: 'Web' },
                { value: 'mobile', label: 'Mobile' },
              ],
            },
            { value: 'sales', label: 'Sales' },
          ],
        },
        {
          name: 'rank',
          type: 'sortable',
          label: 'What matters most?',
          numbered: true,
          options: [
            { value: 'speed', label: 'Speed' },
            { value: 'price', label: 'Price' },
            { value: 'support', label: 'Support' },
          ],
        },
        {
          name: 'members',
          type: 'transfer',
          label: 'Members',
          options: [
            { value: 'ada', label: 'Ada' },
            { value: 'alan', label: 'Alan' },
            { value: 'grace', label: 'Grace' },
          ],
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback',
      columns: 2,
      fields: [
        { name: 'stars', type: 'rating', label: 'Your rating' },
        {
          name: 'nps',
          type: 'scale',
          label: 'How likely are you to recommend us?',
          min: 0,
          max: 10,
          minLabel: 'Not likely',
          maxLabel: 'Very likely',
          span: 2,
        },
        { name: 'repeat', type: 'recurrence', label: 'Repeats', span: 2 },
        { name: 'logo', type: 'image', label: 'Logo', shape: 'square' },
        { name: 'headers', type: 'keyvalue', label: 'Headers' },
        {
          name: 'note',
          type: 'mention',
          label: 'Note',
          span: 2,
          options: [
            { value: 'ada', label: 'Ada Lovelace' },
            { value: 'alan', label: 'Alan Turing' },
          ],
        },
        { name: 'config', type: 'json', label: 'Config', span: 2, rows: 4 },
      ],
    },
  ],
}
