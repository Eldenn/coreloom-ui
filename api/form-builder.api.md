# @coreloom/form-builder

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/form-builder.tsx

```ts
function addFormField(spec: FormSpec, field: FormFieldSpec, at?: { sectionId?: string; after?: string; }) => FormSpec
function FormBuilder
FormBuilder.value?: FormSpec | undefined
FormBuilder.defaultValue?: FormSpec | undefined
FormBuilder.onValueChange?: ((spec: FormSpec) => void) | undefined
FormBuilder.types?: FormFieldTypes | undefined
FormBuilder.onPreviewSubmit?: ((values: FormValues) => void) | undefined
FormBuilder.className?: string | undefined
type FormBuilderProps = {}
FormBuilderProps.value?: FormSpec | undefined
FormBuilderProps.defaultValue?: FormSpec | undefined
FormBuilderProps.onValueChange?: ((spec: FormSpec) => void) | undefined
FormBuilderProps.types?: FormFieldTypes | undefined
FormBuilderProps.onPreviewSubmit?: ((values: FormValues) => void) | undefined
FormBuilderProps.className?: string | undefined
function moveFormField(spec: FormSpec, name: string, sectionId: string, index: number) => FormSpec
function removeFormField(spec: FormSpec, name: string) => FormSpec
function removeSection(spec: FormSpec, id: string) => FormSpec
function updateFormField(spec: FormSpec, name: string, patch: Partial<FormFieldSpec>) => FormSpec
function updateSection(spec: FormSpec, id: string, patch: Partial<FormSectionSpec>) => FormSpec
```
