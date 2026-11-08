# @coreloom/form-renderer

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/form-renderer.tsx

```ts
function checkFormField(field: FormFieldSpec, value: unknown, types?: FormFieldTypes) => FormFieldError | undefined
function evaluateCondition(condition: FormCondition | undefined, values: FormValues) => boolean
function fieldSpanClass(field: FormFieldSpec, columns?: number) => string
type FormCondition = { field: string; op: FormConditionOp; value?: unknown; } | { all: FormCondition[]; } | { any: FormCondition[]; }
type FormConditionOp = 'contains' | 'equals' | 'notEquals' | 'gt' | 'lt' | 'in' | 'filled' | 'empty'
type FormFieldCheck = 'length' | 'pattern' | 'range' | 'dateRange' | 'timeRange' | 'items'
type FormFieldError = { type: 'required' | 'checked' | 'email' | 'url' | 'phone' | 'pattern' | 'json'; } | { type: 'minLength' | 'maxLength' | 'min' | 'max' | 'minItems' | 'maxItems'; limit: number | string; } | { type: 'dateMin' | 'dateMax' | 'timeMin' | 'timeMax'; limit: string; } | { type: 'custom'; message: string; }
type FormFieldSetting = {}
FormFieldSetting.key: string
FormFieldSetting.kind: 'number' | 'boolean' | 'text' | 'select' | 'list'
FormFieldSetting.choices?: readonly { value: string; label: string; }[] | undefined
type FormFieldSpec = {}
FormFieldSpec.name: string
FormFieldSpec.type: string
FormFieldSpec.label: string
FormFieldSpec.description?: string | undefined
FormFieldSpec.placeholder?: string | undefined
FormFieldSpec.required?: boolean | undefined
FormFieldSpec.defaultValue?: unknown
FormFieldSpec.span?: 1 | 2 | 3 | undefined
FormFieldSpec.visibleWhen?: FormCondition | undefined
FormFieldSpec.minLength?: number | undefined
FormFieldSpec.maxLength?: number | undefined
FormFieldSpec.pattern?: string | undefined
FormFieldSpec.patternMessage?: string | undefined
FormFieldSpec.min?: string | number | undefined
FormFieldSpec.max?: string | number | undefined
FormFieldSpec.minItems?: number | undefined
FormFieldSpec.maxItems?: number | undefined
FormFieldSpec.options?: FormOption[] | undefined
type FormFieldType = {}
FormFieldType.type: string
FormFieldType.label: string
FormFieldType.icon: LucideIcon
FormFieldType.group: 'number' | 'text' | 'date' | 'choice' | 'other'
FormFieldType.empty: unknown
FormFieldType.emptyOf?: ((field: FormFieldSpec) => unknown) | undefined
FormFieldType.isEmpty?: ((value: unknown, field: FormFieldSpec) => boolean) | undefined
FormFieldType.rangeInput?: 'date' | 'month' | 'week' | undefined
FormFieldType.inline?: boolean | undefined
FormFieldType.hasOptions?: boolean | undefined
FormFieldType.placeholder?: boolean | undefined
FormFieldType.settings?: readonly FormFieldSetting[] | undefined
FormFieldType.checks?: readonly FormFieldCheck[] | undefined
FormFieldType.render: (field: FormFieldSpec, label: React.ReactNode) => React.ReactNode
FormFieldType.fromJSON?: ((value: unknown, field: FormFieldSpec) => unknown) | undefined
FormFieldType.toJSON?: ((value: unknown, field: FormFieldSpec) => unknown) | undefined
FormFieldType.validate?: ((value: unknown, field: FormFieldSpec) => FormFieldError | undefined) | undefined
type FormFieldTypes = { [x: string]: FormFieldType; }
const formFieldTypes: FormFieldTypes
type FormOption = {}
FormOption.value: string
FormOption.label: string
FormOption.description?: string | undefined
FormOption.disabled?: boolean | undefined
FormOption.children?: FormOption[] | undefined
function FormRenderer
FormRenderer.spec: FormSpec
FormRenderer.types?: FormFieldTypes | undefined
FormRenderer.defaultValues?: FormValues | undefined
FormRenderer.onSubmit?: ((values: FormValues) => void | Promise<void>) | undefined
FormRenderer.onValuesChange?: ((values: FormValues) => void) | undefined
FormRenderer.submitLabel?: React.ReactNode
FormRenderer.hideHeader?: boolean | undefined
FormRenderer.hideSubmit?: boolean | undefined
FormRenderer.showHidden?: boolean | undefined
FormRenderer.renderField?: ((field: FormFieldSpec, node: React.ReactNode, visible: boolean) => React.ReactNode) | undefined
FormRenderer.renderSection?: ((section: FormSectionSpec, node: React.ReactNode) => React.ReactNode) | undefined
FormRenderer.className?: string | undefined
type FormRendererProps = {}
FormRendererProps.spec: FormSpec
FormRendererProps.types?: FormFieldTypes | undefined
FormRendererProps.defaultValues?: FormValues | undefined
FormRendererProps.onSubmit?: ((values: FormValues) => void | Promise<void>) | undefined
FormRendererProps.onValuesChange?: ((values: FormValues) => void) | undefined
FormRendererProps.submitLabel?: React.ReactNode
FormRendererProps.hideHeader?: boolean | undefined
FormRendererProps.hideSubmit?: boolean | undefined
FormRendererProps.showHidden?: boolean | undefined
FormRendererProps.renderField?: ((field: FormFieldSpec, node: React.ReactNode, visible: boolean) => React.ReactNode) | undefined
FormRendererProps.renderSection?: ((section: FormSectionSpec, node: React.ReactNode) => React.ReactNode) | undefined
FormRendererProps.className?: string | undefined
type FormSectionSpec = {}
FormSectionSpec.id: string
FormSectionSpec.title?: string | undefined
FormSectionSpec.description?: string | undefined
FormSectionSpec.columns?: 1 | 2 | 3 | undefined
FormSectionSpec.fields: FormFieldSpec[]
type FormSpec = {}
FormSpec.version: 1
FormSpec.title?: string | undefined
FormSpec.description?: string | undefined
FormSpec.submitLabel?: string | undefined
FormSpec.sections: FormSectionSpec[]
type FormSpecIssue = {}
FormSpecIssue.path: string
FormSpecIssue.code: 'notObject' | 'missingName' | 'duplicateName' | 'unknownType' | 'noOptions' | 'badCondition' | 'tooMany'
FormSpecIssue.detail?: string | undefined
function formSpecValues(spec: FormSpec, values: FormValues, types?: FormFieldTypes) => FormValues
type FormValues = { [x: string]: unknown; }
function fromJSONSchema(schema: unknown, uiSchema?: unknown, types?: FormFieldTypes) => { spec: FormSpec; issues: FormSpecIssue[]; }
function initialFormValues(spec: FormSpec, types?: FormFieldTypes, defaultValues?: FormValues) => FormValues
function isFieldVisible(spec: FormSpec, name: string, submitted: FormValues, seen?: Set<string>) => boolean
type JSONSchema = { [x: string]: unknown; }
function readFormSpec(value: unknown, types?: FormFieldTypes) => { spec: FormSpec; issues: FormSpecIssue[]; }
function toJSONSchema(spec: FormSpec) => { schema: JSONSchema; uiSchema: Record<string, unknown>; }
```
