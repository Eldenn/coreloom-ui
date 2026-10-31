import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'Components/Forms/Inputs',
  component: Field,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field>
export default meta
type Story = StoryObj<typeof meta>

export const TextFields: Story = {
  render: () => (
    <FieldGroup className="max-w-md">
      <Field>
        <FieldLabel htmlFor="name">Project name</FieldLabel>
        <Input id="name" defaultValue="coreloom-app" />
        <FieldDescription>Lowercase, hyphen-separated.</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" defaultValue="not-an-email" aria-invalid />
        <FieldError>Enter a valid email address.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="notes">Release notes</FieldLabel>
        <Textarea id="notes" placeholder="What changed in this version?" />
      </Field>
    </FieldGroup>
  ),
}

export const SelectField: Story = {
  name: 'Select',
  render: () => (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="region">Region</FieldLabel>
      <Select defaultValue="cdg1">
        <SelectTrigger id="region" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="cdg1">Paris (cdg1)</SelectItem>
            <SelectItem value="fra1">Frankfurt (fra1)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="iad1">Washington (iad1)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  ),
}

export const Choices: Story = {
  name: 'Checkbox, Radio, Switch',
  render: () => (
    <FieldGroup className="max-w-md">
      <Field orientation="horizontal">
        <Checkbox id="terms" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="terms">Deploy on push</FieldLabel>
          <FieldDescription>Every push to main ships to production.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldSet>
        <FieldLegend>Module format</FieldLegend>
        <RadioGroup defaultValue="esm">
          <div className="flex items-center gap-2.5">
            <RadioGroupItem value="esm" id="esm" />
            <Label htmlFor="esm">ES modules</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <RadioGroupItem value="cjs" id="cjs" />
            <Label htmlFor="cjs">CommonJS</Label>
          </div>
        </RadioGroup>
      </FieldSet>
      <Field orientation="horizontal">
        <Switch id="auto" defaultChecked />
        <FieldLabel htmlFor="auto">Auto-deploy main</FieldLabel>
      </Field>
    </FieldGroup>
  ),
}

export const SliderField: Story = {
  name: 'Slider',
  render: () => (
    <Field className="max-w-sm">
      <FieldLabel>Build concurrency</FieldLabel>
      <Slider defaultValue={[4]} min={1} max={16} step={1} aria-label="Build concurrency" />
      <Slider defaultValue={[20, 80]} aria-label="Range" />
    </Field>
  ),
}
