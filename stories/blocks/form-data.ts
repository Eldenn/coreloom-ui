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
