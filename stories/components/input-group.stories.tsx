import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpIcon, AtSignIcon, CopyIcon, PaperclipIcon, SearchIcon } from 'lucide-react'
import * as React from 'react'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  PasswordInput,
  SearchInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'

const meta = {
  title: 'Components/Forms/Input group',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A field with addons inside its border: an icon, a prefix or unit, a button, a keyboard hint, or a toolbar above or below a textarea. `PasswordInput` and `SearchInput` are ready-made groups. The consumer wires the field like any `Input` (value, onChange, aria-invalid) and gives buttons an `aria-label`.',
      },
    },
  },
} satisfies Meta<typeof InputGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Addons: Story = {
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="ig-search">Search the docs</FieldLabel>
        <InputGroup>
          <InputGroupInput id="ig-search" placeholder="Components, tokens, blocks…" />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="ig-site">Website</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="ig-site" defaultValue="coreloom.dev" />
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="ig-weight">Parcel weight</FieldLabel>
        <InputGroup>
          <InputGroupInput id="ig-weight" inputMode="decimal" defaultValue="2.4" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>kg</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="ig-handle">Handle</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <AtSignIcon />
          </InputGroupAddon>
          <InputGroupInput id="ig-handle" defaultValue="matthieu" />
        </InputGroup>
        <FieldDescription>Shown on your public profile.</FieldDescription>
      </Field>
    </FieldGroup>
  ),
}

export const WithButtons: Story = {
  name: 'With buttons',
  render: () => {
    const [copied, setCopied] = React.useState(false)
    return (
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="ig-key">Public key</FieldLabel>
          <InputGroup>
            <InputGroupInput id="ig-key" readOnly defaultValue="pk_live_4f9a2c81e0" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Copy the key"
                onClick={() => {
                  setCopied(true)
                }}
              >
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription role="status">{copied ? 'Copied.' : ' '}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ig-invite">Invite by email</FieldLabel>
          <InputGroup>
            <InputGroupInput id="ig-invite" type="email" placeholder="name@company.com" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="secondary" size="sm">
                Invite
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
    )
  },
}

export const TextareaToolbar: Story = {
  name: 'Textarea with a toolbar',
  render: () => (
    <Field className="max-w-lg">
      <FieldLabel htmlFor="ig-comment">Comment</FieldLabel>
      <InputGroup>
        <InputGroupTextarea id="ig-comment" placeholder="Write a comment…" />
        <InputGroupAddon align="block-end" className="border-t border-border-subtle">
          <InputGroupButton size="icon-xs" aria-label="Attach a file">
            <PaperclipIcon />
          </InputGroupButton>
          <InputGroupText className="ml-auto">Markdown supported</InputGroupText>
          <InputGroupButton variant="default" size="icon-xs" aria-label="Send">
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  ),
}

export const Password: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="ig-password">Password</FieldLabel>
      <PasswordInput id="ig-password" defaultValue="correct horse battery" />
    </Field>
  ),
}

export const Search: Story = {
  render: () => {
    const [query, setQuery] = React.useState('gauge')
    return (
      <Field className="max-w-sm">
        <FieldLabel htmlFor="ig-find">Find a component</FieldLabel>
        <SearchInput id="ig-find" value={query} onValueChange={setQuery} placeholder="Search…" />
        <FieldDescription>Query: {query || 'empty'}</FieldDescription>
      </Field>
    )
  },
}

export const Invalid: Story = {
  render: () => (
    <Field className="max-w-sm" data-invalid="true">
      <FieldLabel htmlFor="ig-domain">Custom domain</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id="ig-domain"
          defaultValue="my site"
          aria-invalid
          aria-describedby="ig-domain-error"
        />
      </InputGroup>
      <FieldError id="ig-domain-error">A domain can’t contain spaces.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="ig-off">Password</FieldLabel>
      <PasswordInput id="ig-off" defaultValue="secret" disabled />
    </Field>
  ),
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="ig-fr-pass">Mot de passe</FieldLabel>
        <PasswordInput id="ig-fr-pass" defaultValue="cheval correct" />
      </Field>
      <Field>
        <FieldLabel htmlFor="ig-fr-search">Rechercher</FieldLabel>
        <SearchInput id="ig-fr-search" defaultValue="jauge" />
      </Field>
    </FieldGroup>
  ),
}
