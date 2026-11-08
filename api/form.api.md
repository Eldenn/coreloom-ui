# @coreloom/form

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/form.tsx

```ts
function CheckboxField
CheckboxField.label: React.ReactNode
CheckboxField.description?: React.ReactNode
CheckboxField.className?: string | undefined
CheckboxField.disabled?: boolean | undefined
function CheckboxGroupField
CheckboxGroupField.label: React.ReactNode
CheckboxGroupField.description?: React.ReactNode
CheckboxGroupField.className?: string | undefined
CheckboxGroupField.options: Option[]
CheckboxGroupField.disabled?: boolean | undefined
function ChipField
ChipField.label: React.ReactNode
ChipField.description?: React.ReactNode
ChipField.className?: string | undefined
ChipField.labelAction?: React.ReactNode
ChipField.hideLabel?: boolean | undefined
ChipField.options: ChipOption[]
ChipField.type?: 'multiple' | 'single' | undefined
ChipField.size?: 'sm' | 'default' | undefined
ChipField.disabled?: boolean | undefined
function ColorField
ColorField.label: React.ReactNode
ColorField.description?: React.ReactNode
ColorField.className?: string | undefined
ColorField.labelAction?: React.ReactNode
ColorField.hideLabel?: boolean | undefined
ColorField.disabled?: boolean | undefined
ColorField.swatches?: import("@/components/ui/color-picker").ColorSwatch[] | undefined
ColorField.allowCustom?: boolean | undefined
function ComboboxField
ComboboxField.label: React.ReactNode
ComboboxField.description?: React.ReactNode
ComboboxField.className?: string | undefined
ComboboxField.labelAction?: React.ReactNode
ComboboxField.hideLabel?: boolean | undefined
ComboboxField.placeholder?: string | undefined
ComboboxField.options: import("@/components/ui/combobox").ComboboxOption[]
ComboboxField.disabled?: boolean | undefined
ComboboxField.aria-label?: string | undefined
ComboboxField.searchPlaceholder?: string | undefined
ComboboxField.emptyText?: React.ReactNode
ComboboxField.contentClassName?: string | undefined
ComboboxField.clearable?: boolean | undefined
ComboboxField.onCreate?: ((label: string) => string | undefined) | undefined
function DateField
DateField.label: React.ReactNode
DateField.description?: React.ReactNode
DateField.className?: string | undefined
DateField.labelAction?: React.ReactNode
DateField.hideLabel?: boolean | undefined
DateField.typing?: boolean | undefined
DateField.placeholder?: string | undefined
DateField.disabled?: boolean | undefined
DateField.aria-label?: string | undefined
DateField.locale?: import("date-fns").Locale | undefined
DateField.formatString?: string | undefined
DateField.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof Button>['variant']; }, 'selected' | 'onSelect' | 'mode'> | undefined
function DateRangeField
DateRangeField.label: React.ReactNode
DateRangeField.description?: React.ReactNode
DateRangeField.className?: string | undefined
DateRangeField.labelAction?: React.ReactNode
DateRangeField.hideLabel?: boolean | undefined
DateRangeField.placeholder?: string | undefined
DateRangeField.disabled?: boolean | undefined
DateRangeField.aria-label?: string | undefined
DateRangeField.numberOfMonths?: number | undefined
DateRangeField.locale?: import("date-fns").Locale | undefined
DateRangeField.formatString?: string | undefined
DateRangeField.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof Button>['variant']; }, 'selected' | 'required' | 'onSelect' | 'mode'> | undefined
DateRangeField.presets?: false | import("@/components/ui/date-range-picker").DateRangePreset[] | undefined
function DateTimeField
DateTimeField.label: React.ReactNode
DateTimeField.description?: React.ReactNode
DateTimeField.className?: string | undefined
DateTimeField.labelAction?: React.ReactNode
DateTimeField.hideLabel?: boolean | undefined
DateTimeField.step?: number | undefined
DateTimeField.disabled?: boolean | undefined
DateTimeField.aria-label?: string | undefined
DateTimeField.locale?: string | undefined
DateTimeField.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof Button>['variant']; }, 'selected' | 'onSelect' | 'mode'> | undefined
DateTimeField.defaultTime?: string | undefined
DateTimeField.minTime?: string | undefined
DateTimeField.maxTime?: string | undefined
DateTimeField.dateLocale?: import("date-fns").Locale | undefined
function describedBy(meta: Meta, description?: React.ReactNode) => string | undefined
function DurationField
DurationField.label: React.ReactNode
DurationField.description?: React.ReactNode
DurationField.className?: string | undefined
DurationField.labelAction?: React.ReactNode
DurationField.hideLabel?: boolean | undefined
DurationField.min?: number | undefined
DurationField.step?: number | undefined
DurationField.max?: number | undefined
DurationField.placeholder?: string | undefined
DurationField.disabled?: boolean | undefined
function FileField
FileField.label: React.ReactNode
FileField.description?: React.ReactNode
FileField.className?: string | undefined
FileField.labelAction?: React.ReactNode
FileField.hideLabel?: boolean | undefined
FileField.accept?: string | undefined
FileField.multiple?: boolean | undefined
FileField.maxSize?: number | undefined
FileField.progress?: ((file: File) => number | undefined) | undefined
FileField.disabled?: boolean | undefined
FileField.onReject?: ((rejections: import("@/components/ui/file-upload").FileRejection[]) => void) | undefined
FileField.maxFiles?: number | undefined
function FormErrors
FormErrors.title?: React.ReactNode
FormErrors.className?: string | undefined
function ImageField
ImageField.label: React.ReactNode
ImageField.description?: React.ReactNode
ImageField.className?: string | undefined
ImageField.labelAction?: React.ReactNode
ImageField.hideLabel?: boolean | undefined
ImageField.accept?: string | undefined
ImageField.shape?: 'square' | 'circle' | 'wide' | undefined
ImageField.maxSize?: number | undefined
ImageField.disabled?: boolean | undefined
ImageField.hint?: React.ReactNode
ImageField.fallback?: React.ReactNode
function JsonField
JsonField.label: React.ReactNode
JsonField.description?: React.ReactNode
JsonField.className?: string | undefined
JsonField.labelAction?: React.ReactNode
JsonField.hideLabel?: boolean | undefined
JsonField.rows?: number | undefined
JsonField.formatOnBlur?: boolean | undefined
JsonField.placeholder?: string | undefined
JsonField.disabled?: boolean | undefined
JsonField.readOnly?: boolean | undefined
JsonField.indent?: number | undefined
function KeyValueField
KeyValueField.label: React.ReactNode
KeyValueField.description?: React.ReactNode
KeyValueField.className?: string | undefined
KeyValueField.labelAction?: React.ReactNode
KeyValueField.hideLabel?: boolean | undefined
KeyValueField.disabled?: boolean | undefined
KeyValueField.keyLabel?: string | undefined
KeyValueField.valueLabel?: string | undefined
KeyValueField.keyPlaceholder?: string | undefined
KeyValueField.valuePlaceholder?: string | undefined
KeyValueField.addLabel?: string | undefined
KeyValueField.maxRows?: number | undefined
KeyValueField.sensitive?: boolean | undefined
function MaskedField
MaskedField.label: React.ReactNode
MaskedField.description?: React.ReactNode
MaskedField.className?: string | undefined
MaskedField.labelAction?: React.ReactNode
MaskedField.hideLabel?: boolean | undefined
MaskedField.preset?: 'iban' | 'card' | 'siren' | 'siret' | undefined
MaskedField.mask?: import("@/components/ui/masked-input").Mask | undefined
MaskedField.validate?: ((raw: string) => boolean) | undefined
MaskedField.invalidMessage?: string | undefined
MaskedField.*: react
function MentionField
MentionField.label: React.ReactNode
MentionField.description?: React.ReactNode
MentionField.className?: string | undefined
MentionField.labelAction?: React.ReactNode
MentionField.hideLabel?: boolean | undefined
MentionField.rows?: number | undefined
MentionField.trigger?: string | undefined
MentionField.placeholder?: string | undefined
MentionField.options: import("@/components/ui/mention-textarea").MentionOption[]
MentionField.disabled?: boolean | undefined
MentionField.maxSuggestions?: number | undefined
function MoneyField
MoneyField.label: React.ReactNode
MoneyField.description?: React.ReactNode
MoneyField.className?: string | undefined
MoneyField.labelAction?: React.ReactNode
MoneyField.hideLabel?: boolean | undefined
MoneyField.min?: number | undefined
MoneyField.currency?: string | undefined
MoneyField.allowNegative?: boolean | undefined
MoneyField.max?: number | undefined
MoneyField.placeholder?: string | undefined
MoneyField.name?: string | undefined
MoneyField.disabled?: boolean | undefined
MoneyField.aria-label?: string | undefined
MoneyField.locale?: string | undefined
function MonthField
MonthField.label: React.ReactNode
MonthField.description?: React.ReactNode
MonthField.className?: string | undefined
MonthField.labelAction?: React.ReactNode
MonthField.hideLabel?: boolean | undefined
MonthField.min?: string | undefined
MonthField.max?: string | undefined
MonthField.placeholder?: string | undefined
MonthField.disabled?: boolean | undefined
function MultiSelectField
MultiSelectField.label: React.ReactNode
MultiSelectField.description?: React.ReactNode
MultiSelectField.className?: string | undefined
MultiSelectField.labelAction?: React.ReactNode
MultiSelectField.hideLabel?: boolean | undefined
MultiSelectField.placeholder?: string | undefined
MultiSelectField.options: import("@/components/ui/multi-select").MultiSelectOption[]
MultiSelectField.disabled?: boolean | undefined
MultiSelectField.aria-label?: string | undefined
MultiSelectField.searchPlaceholder?: string | undefined
MultiSelectField.emptyText?: React.ReactNode
MultiSelectField.maxShown?: number | undefined
MultiSelectField.maxSelected?: number | undefined
function NumberField
NumberField.label: React.ReactNode
NumberField.description?: React.ReactNode
NumberField.className?: string | undefined
NumberField.labelAction?: React.ReactNode
NumberField.hideLabel?: boolean | undefined
NumberField.min?: number | undefined
NumberField.step?: number | undefined
NumberField.stepper?: 'end' | 'sides' | 'none' | undefined
NumberField.max?: number | undefined
NumberField.placeholder?: string | undefined
NumberField.disabled?: boolean | undefined
NumberField.aria-label?: string | undefined
NumberField.aria-labelledby?: string | undefined
NumberField.readOnly?: boolean | undefined
NumberField.locale?: string | undefined
NumberField.largeStep?: number | undefined
NumberField.formatOptions?: import("@/components/ui/number-input").NumberFormatOptions | undefined
function NumberRangeField
NumberRangeField.label: React.ReactNode
NumberRangeField.description?: React.ReactNode
NumberRangeField.className?: string | undefined
NumberRangeField.labelAction?: React.ReactNode
NumberRangeField.hideLabel?: boolean | undefined
NumberRangeField.min?: number | undefined
NumberRangeField.step?: number | undefined
NumberRangeField.max?: number | undefined
NumberRangeField.minLabel?: string | undefined
NumberRangeField.maxLabel?: string | undefined
NumberRangeField.disabled?: boolean | undefined
NumberRangeField.formatOptions?: import("@/components/ui/number-input").NumberFormatOptions | undefined
function OTPField
OTPField.label: React.ReactNode
OTPField.description?: React.ReactNode
OTPField.className?: string | undefined
OTPField.labelAction?: React.ReactNode
OTPField.hideLabel?: boolean | undefined
OTPField.length?: number | undefined
OTPField.groupSize?: number | undefined
OTPField.pattern?: string | undefined
OTPField.submitOnComplete?: boolean | undefined
OTPField.autoFocus?: boolean | undefined
OTPField.disabled?: boolean | undefined
function PasswordField
PasswordField.label: React.ReactNode
PasswordField.description?: React.ReactNode
PasswordField.className?: string | undefined
PasswordField.labelAction?: React.ReactNode
PasswordField.hideLabel?: boolean | undefined
PasswordField.showLabel?: string | undefined
PasswordField.*: react
function PhoneField
PhoneField.label: React.ReactNode
PhoneField.description?: React.ReactNode
PhoneField.className?: string | undefined
PhoneField.labelAction?: React.ReactNode
PhoneField.hideLabel?: boolean | undefined
PhoneField.defaultCountry?: string | undefined
PhoneField.placeholder?: string | undefined
PhoneField.name?: string | undefined
PhoneField.disabled?: boolean | undefined
PhoneField.aria-label?: string | undefined
PhoneField.countries?: import("@/components/ui/phone-input").PhoneCountry[] | undefined
function RadioCardField
RadioCardField.label: React.ReactNode
RadioCardField.description?: React.ReactNode
RadioCardField.className?: string | undefined
RadioCardField.labelAction?: React.ReactNode
RadioCardField.hideLabel?: boolean | undefined
RadioCardField.options: CardOption[]
RadioCardField.orientation?: 'vertical' | 'horizontal' | undefined
RadioCardField.disabled?: boolean | undefined
function RadioGroupField
RadioGroupField.label: React.ReactNode
RadioGroupField.description?: React.ReactNode
RadioGroupField.className?: string | undefined
RadioGroupField.options: Option[]
RadioGroupField.disabled?: boolean | undefined
function RatingField
RatingField.label: React.ReactNode
RatingField.description?: React.ReactNode
RatingField.className?: string | undefined
RatingField.labelAction?: React.ReactNode
RatingField.hideLabel?: boolean | undefined
RatingField.max?: number | undefined
RatingField.size?: 'sm' | 'lg' | 'default' | undefined
RatingField.disabled?: boolean | undefined
function RecurrenceField
RecurrenceField.label: React.ReactNode
RecurrenceField.description?: React.ReactNode
RecurrenceField.className?: string | undefined
RecurrenceField.labelAction?: React.ReactNode
RecurrenceField.hideLabel?: boolean | undefined
RecurrenceField.frequencies?: import("@/components/ui/recurrence-input").RecurrenceFrequency[] | undefined
RecurrenceField.disabled?: boolean | undefined
function ScaleField
ScaleField.label: React.ReactNode
ScaleField.description?: React.ReactNode
ScaleField.className?: string | undefined
ScaleField.labelAction?: React.ReactNode
ScaleField.hideLabel?: boolean | undefined
ScaleField.min?: number | undefined
ScaleField.max?: number | undefined
ScaleField.minLabel?: string | undefined
ScaleField.maxLabel?: string | undefined
ScaleField.labels?: string[] | undefined
ScaleField.disabled?: boolean | undefined
function SegmentedField
SegmentedField.label: React.ReactNode
SegmentedField.description?: React.ReactNode
SegmentedField.className?: string | undefined
SegmentedField.labelAction?: React.ReactNode
SegmentedField.hideLabel?: boolean | undefined
SegmentedField.size?: 'sm' | 'default' | undefined
SegmentedField.options: import("@/components/ui/segmented-control").SegmentedOption[]
SegmentedField.disabled?: boolean | undefined
SegmentedField.iconOnly?: boolean | undefined
SegmentedField.fullWidth?: boolean | undefined
function SelectField
SelectField.label: React.ReactNode
SelectField.description?: React.ReactNode
SelectField.className?: string | undefined
SelectField.labelAction?: React.ReactNode
SelectField.hideLabel?: boolean | undefined
SelectField.options: Option[]
SelectField.placeholder?: string | undefined
SelectField.disabled?: boolean | undefined
function SliderField
SliderField.className?: string | undefined
SliderField.description?: React.ReactNode
SliderField.labelAction?: React.ReactNode
SliderField.hideLabel?: boolean | undefined
SliderField.label: string
SliderField.min?: number | undefined
SliderField.step?: number | undefined
SliderField.max?: number | undefined
SliderField.disabled?: boolean | undefined
SliderField.formatOptions?: import("@/components/ui/number-input").NumberFormatOptions | undefined
SliderField.inputClassName?: string | undefined
function SortableField
SortableField.label: React.ReactNode
SortableField.description?: React.ReactNode
SortableField.className?: string | undefined
SortableField.labelAction?: React.ReactNode
SortableField.hideLabel?: boolean | undefined
SortableField.numbered?: boolean | undefined
SortableField.options: import("@/components/ui/sortable-list").SortableOption[]
SortableField.disabled?: boolean | undefined
function SubmitButton
SubmitButton.size?: 'sm' | 'lg' | 'default' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined
SubmitButton.variant?: 'link' | 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | null | undefined
SubmitButton.asChild?: boolean | undefined
SubmitButton.pendingLabel?: React.ReactNode
SubmitButton.pending?: boolean | undefined
SubmitButton.*: react
function SwitchField
SwitchField.label: React.ReactNode
SwitchField.description?: React.ReactNode
SwitchField.className?: string | undefined
SwitchField.disabled?: boolean | undefined
function TagsField
TagsField.label: React.ReactNode
TagsField.description?: React.ReactNode
TagsField.className?: string | undefined
TagsField.labelAction?: React.ReactNode
TagsField.hideLabel?: boolean | undefined
TagsField.placeholder?: string | undefined
TagsField.transform?: ((tag: string) => string) | undefined
TagsField.disabled?: boolean | undefined
TagsField.aria-label?: string | undefined
TagsField.maxTags?: number | undefined
TagsField.allowDuplicates?: boolean | undefined
function TextareaField
TextareaField.label: React.ReactNode
TextareaField.description?: React.ReactNode
TextareaField.className?: string | undefined
TextareaField.labelAction?: React.ReactNode
TextareaField.hideLabel?: boolean | undefined
TextareaField.maxCount?: number | undefined
TextareaField.*: react
function TextField
TextField.label: React.ReactNode
TextField.description?: React.ReactNode
TextField.className?: string | undefined
TextField.labelAction?: React.ReactNode
TextField.hideLabel?: boolean | undefined
TextField.maxCount?: number | undefined
TextField.*: react
function TimeField
TimeField.label: React.ReactNode
TimeField.description?: React.ReactNode
TimeField.className?: string | undefined
TimeField.labelAction?: React.ReactNode
TimeField.hideLabel?: boolean | undefined
TimeField.min?: string | undefined
TimeField.step?: number | undefined
TimeField.max?: string | undefined
TimeField.placeholder?: string | undefined
TimeField.disabled?: boolean | undefined
TimeField.aria-label?: string | undefined
TimeField.locale?: string | undefined
function TimeRangeField
TimeRangeField.label: React.ReactNode
TimeRangeField.description?: React.ReactNode
TimeRangeField.className?: string | undefined
TimeRangeField.labelAction?: React.ReactNode
TimeRangeField.hideLabel?: boolean | undefined
TimeRangeField.min?: string | undefined
TimeRangeField.step?: number | undefined
TimeRangeField.max?: string | undefined
TimeRangeField.overnight?: boolean | undefined
TimeRangeField.disabled?: boolean | undefined
TimeRangeField.startLabel?: string | undefined
TimeRangeField.endLabel?: string | undefined
function TimezoneField
TimezoneField.label: React.ReactNode
TimezoneField.description?: React.ReactNode
TimezoneField.className?: string | undefined
TimezoneField.labelAction?: React.ReactNode
TimezoneField.hideLabel?: boolean | undefined
TimezoneField.date?: Date | undefined
TimezoneField.placeholder?: string | undefined
TimezoneField.disabled?: boolean | undefined
TimezoneField.clearable?: boolean | undefined
TimezoneField.timeZones?: string[] | undefined
function TransferField
TransferField.label: React.ReactNode
TransferField.description?: React.ReactNode
TransferField.className?: string | undefined
TransferField.labelAction?: React.ReactNode
TransferField.hideLabel?: boolean | undefined
TransferField.availableLabel?: string | undefined
TransferField.selectedLabel?: string | undefined
TransferField.options: import("@/components/ui/transfer-list").TransferOption[]
TransferField.disabled?: boolean | undefined
function TreeSelectField
TreeSelectField.label: React.ReactNode
TreeSelectField.description?: React.ReactNode
TreeSelectField.className?: string | undefined
TreeSelectField.labelAction?: React.ReactNode
TreeSelectField.hideLabel?: boolean | undefined
TreeSelectField.nodes: TreeNode[]
TreeSelectField.multiple?: boolean | undefined
TreeSelectField.placeholder?: string | undefined
TreeSelectField.disabled?: boolean | undefined
function UnitField
UnitField.label: React.ReactNode
UnitField.description?: React.ReactNode
UnitField.className?: string | undefined
UnitField.labelAction?: React.ReactNode
UnitField.hideLabel?: boolean | undefined
UnitField.min?: number | undefined
UnitField.step?: number | undefined
UnitField.stepper?: 'end' | 'sides' | 'none' | undefined
UnitField.max?: number | undefined
UnitField.units: import("@/components/ui/unit-input").UnitOption[]
UnitField.placeholder?: string | undefined
UnitField.disabled?: boolean | undefined
UnitField.formatOptions?: import("@/components/ui/number-input").NumberFormatOptions | undefined
UnitField.convert?: ((value: number, from: string, to: string) => number) | undefined
UnitField.unitLabel?: string | undefined
function useAppForm<TFormData, TOnMount extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChange extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChangeAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnBlur extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnBlurAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnSubmit extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnSubmitAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnDynamic extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnDynamicAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnServer extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TSubmitMeta>(props: import("@tanstack/react-form").FormOptions<TFormData, TOnMount, TOnChange, TOnChangeAsync, TOnBlur, TOnBlurAsync, TOnSubmit, TOnSubmitAsync, TOnDynamic, TOnDynamicAsync, TOnServer, TSubmitMeta>) => import("@tanstack/react-form").AppFieldExtendedReactFormApi<TFormData, TOnMount, TOnChange, TOnChangeAsync, TOnBlur, TOnBlurAsync, TOnSubmit, TOnSubmitAsync, TOnDynamic, TOnDynamicAsync, TOnServer, TSubmitMeta, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }>
function useFieldContext<TData>() => import("@tanstack/react-form").FieldApi<any, string, TData, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
function useFieldMeta() => { field: import("@tanstack/react-form").FieldApi<any, string, unknown, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>; id: string; labelId: string; descriptionId: string; errorId: string; invalid: boolean; issues: FieldIssue[]; }
function useFormContext() => import("@tanstack/react-form").ReactFormExtendedApi<Record<string, never>, any, any, any, any, any, any, any, any, any, any, any>
function VerticalShell
VerticalShell.label: React.ReactNode
VerticalShell.description?: React.ReactNode
VerticalShell.className?: string | undefined
VerticalShell.labelAction?: React.ReactNode
VerticalShell.hideLabel?: boolean | undefined
VerticalShell.meta: {}
VerticalShell.meta.field: import("@tanstack/react-form").FieldApi<any, string, unknown, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>
VerticalShell.meta.id: string
VerticalShell.meta.labelId: string
VerticalShell.meta.descriptionId: string
VerticalShell.meta.errorId: string
VerticalShell.meta.invalid: boolean
VerticalShell.meta.issues: FieldIssue[]
VerticalShell.group?: boolean | undefined
VerticalShell.children: React.ReactNode
type VerticalShellProps = FieldShellProps & { labelAction?: React.ReactNode; hideLabel?: boolean; }
function WeekField
WeekField.label: React.ReactNode
WeekField.description?: React.ReactNode
WeekField.className?: string | undefined
WeekField.labelAction?: React.ReactNode
WeekField.hideLabel?: boolean | undefined
WeekField.placeholder?: string | undefined
WeekField.disabled?: boolean | undefined
WeekField.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof Button>['variant']; }, 'selected' | 'onSelect' | 'mode' | 'onDayClick'> | undefined
function withFieldGroup<TFieldGroupData, TSubmitMeta, TRenderProps extends object = {}>({ render, props, defaultValues, }: import("@tanstack/react-form").WithFieldGroupProps<TFieldGroupData, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }, TSubmitMeta, TRenderProps>) => <TFormData, TFields extends import("@tanstack/react-form").DeepKeysOfType<TFormData, TFieldGroupData | null | undefined> | import("@tanstack/react-form").FieldsMap<TFormData, TFieldGroupData>, TOnMount extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChange extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChangeAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnBlur extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnBlurAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnSubmit extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnSubmitAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnDynamic extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnDynamicAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnServer extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TFormSubmitMeta>(params: React.PropsWithChildren<NoInfer<TRenderProps> & { form: import("@tanstack/react-form").AppFieldExtendedReactFormApi<TFormData, TOnMount, TOnChange, TOnChangeAsync, TOnBlur, TOnBlurAsync, TOnSubmit, TOnSubmitAsync, TOnDynamic, TOnDynamicAsync, TOnServer, unknown extends TSubmitMeta ? TFormSubmitMeta : TSubmitMeta, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }> | import("@tanstack/react-form").AppFieldExtendedReactFieldGroupApi<unknown, TFormData, string | import("@tanstack/react-form").FieldsMap<unknown, TFormData>, any, any, any, any, any, any, any, any, any, any, unknown extends TSubmitMeta ? TFormSubmitMeta : TSubmitMeta, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }>; fields: TFields; }>) => ReturnType<React.FunctionComponent>
function withForm<TFormData, TOnMount extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChange extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnChangeAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnBlur extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnBlurAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnSubmit extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnSubmitAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnDynamic extends import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined, TOnDynamicAsync extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TOnServer extends import("@tanstack/react-form").FormAsyncValidateOrFn<TFormData> | undefined, TSubmitMeta, TRenderProps extends object = {}>({ render, props, }: import("@tanstack/react-form").WithFormProps<TFormData, TOnMount, TOnChange, TOnChangeAsync, TOnBlur, TOnBlurAsync, TOnSubmit, TOnSubmitAsync, TOnDynamic, TOnDynamicAsync, TOnServer, TSubmitMeta, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }, TRenderProps>) => React.FunctionComponent<React.PropsWithChildren<NoInfer<[unknown] extends [TRenderProps] ? any : TRenderProps> & { form: import("@tanstack/react-form").AppFieldExtendedReactFormApi<[unknown] extends [TFormData] ? any : TFormData, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnMount] ? [TOnMount] extends [TOnMount & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnMount : TOnMount, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnChange] ? [TOnChange] extends [TOnChange & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnChange : TOnChange, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnChangeAsync] ? [TOnChangeAsync] extends [TOnChangeAsync & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnChangeAsync : TOnChangeAsync, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnBlur] ? [TOnBlur] extends [TOnBlur & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnBlur : TOnBlur, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnBlurAsync] ? [TOnBlurAsync] extends [TOnBlurAsync & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnBlurAsync : TOnBlurAsync, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnSubmit] ? [TOnSubmit] extends [TOnSubmit & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnSubmit : TOnSubmit, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnSubmitAsync] ? [TOnSubmitAsync] extends [TOnSubmitAsync & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnSubmitAsync : TOnSubmitAsync, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnDynamic] ? [TOnDynamic] extends [TOnDynamic & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnDynamic : TOnDynamic, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnDynamicAsync] ? [TOnDynamicAsync] extends [TOnDynamicAsync & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnDynamicAsync : TOnDynamicAsync, [import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined] extends [TOnServer] ? [TOnServer] extends [TOnServer & (import("@tanstack/react-form").FormValidateOrFn<TFormData> | undefined)] ? any : TOnServer : TOnServer, [unknown] extends [TSubmitMeta] ? any : TSubmitMeta, { readonly TextField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TextareaField: ({ label, description, className, labelAction, hideLabel, maxCount, ...props }: VerticalShellProps & { maxCount?: number; } & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly SelectField: ({ label, description, className, labelAction, hideLabel, options, placeholder, disabled, }: VerticalShellProps & { options: Option[]; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly ComboboxField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof Combobox>, 'value' | 'defaultValue' | 'onValueChange' | 'id' | 'className' | 'aria-invalid'>) => React.JSX.Element; readonly MultiSelectField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MultiSelect>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateRangeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly TagsField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TagsInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly FileField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof FileUpload>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly MoneyField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof MoneyInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PhoneField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PhoneInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly NumberField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly PasswordField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'id' | 'name' | 'className'>) => React.JSX.Element; readonly TimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly DateTimeField: (props: VerticalShellProps & Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'id' | 'className' | 'aria-invalid' | 'aria-describedby'>) => React.JSX.Element; readonly RadioGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly MaskedField: (props: VerticalShellProps & ControlProps<typeof MaskedInput, 'onChange'>) => React.JSX.Element; readonly ColorField: (props: VerticalShellProps & ControlProps<typeof ColorPicker>) => React.JSX.Element; readonly RatingField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof Rating, 'readOnly'>) => React.JSX.Element; readonly SliderField: (props: Omit<VerticalShellProps, 'label'> & { label: string; } & ControlProps<typeof SliderInput, 'label'>) => React.JSX.Element; readonly UnitField: (props: VerticalShellProps & ControlProps<typeof UnitInput>) => React.JSX.Element; readonly DurationField: (props: VerticalShellProps & ControlProps<typeof DurationInput>) => React.JSX.Element; readonly MonthField: (props: VerticalShellProps & ControlProps<typeof MonthPicker>) => React.JSX.Element; readonly WeekField: (props: VerticalShellProps & ControlProps<typeof WeekPicker>) => React.JSX.Element; readonly SegmentedField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SegmentedControl>) => React.JSX.Element; readonly RadioCardField: ({ label, description, className, labelAction, hideLabel, options, orientation, disabled, }: VerticalShellProps & { options: CardOption[]; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; }) => React.JSX.Element; readonly CheckboxGroupField: ({ label, description, className, options, disabled, }: FieldShellProps & { options: Option[]; disabled?: boolean; }) => React.JSX.Element; readonly KeyValueField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof KeyValueEditor>) => React.JSX.Element; readonly ChipField: ({ label, description, className, labelAction, hideLabel, options, type, size, disabled, }: VerticalShellProps & { options: ChipOption[]; type?: 'single' | 'multiple'; size?: 'sm' | 'default'; disabled?: boolean; }) => React.JSX.Element; readonly ScaleField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof ScaleInput>) => React.JSX.Element; readonly NumberRangeField: (props: VerticalShellProps & ControlProps<typeof NumberRangeInput>) => React.JSX.Element; readonly TimeRangeField: (props: VerticalShellProps & ControlProps<typeof TimeRangePicker>) => React.JSX.Element; readonly JsonField: (props: VerticalShellProps & ControlProps<typeof JsonInput>) => React.JSX.Element; readonly MentionField: (props: VerticalShellProps & ControlProps<typeof MentionTextarea>) => React.JSX.Element; readonly TreeSelectField: ({ label, description, className, labelAction, hideLabel, nodes, multiple, placeholder, disabled, }: VerticalShellProps & { nodes: TreeNode[]; multiple?: boolean; placeholder?: string; disabled?: boolean; }) => React.JSX.Element; readonly TransferField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof TransferList>) => React.JSX.Element; readonly ImageField: (props: VerticalShellProps & ControlProps<typeof ImageInput>) => React.JSX.Element; readonly SortableField: ({ label, description, className, labelAction, hideLabel, ...props }: VerticalShellProps & ControlProps<typeof SortableList>) => React.JSX.Element; readonly RecurrenceField: (props: VerticalShellProps & ControlProps<typeof RecurrenceInput>) => React.JSX.Element; readonly TimezoneField: (props: VerticalShellProps & ControlProps<typeof TimezoneSelect>) => React.JSX.Element; readonly CheckboxField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly SwitchField: (props: FieldShellProps & { disabled?: boolean; }) => React.JSX.Element; readonly OTPField: ({ label, description, className, labelAction, hideLabel, length, groupSize, pattern, submitOnComplete, autoFocus, disabled, }: VerticalShellProps & { length?: number; groupSize?: number; pattern?: string; submitOnComplete?: boolean; autoFocus?: boolean; disabled?: boolean; }) => React.JSX.Element; }, { readonly SubmitButton: ({ children, pendingLabel, pending, disabled, ...props }: Omit<React.ComponentProps<typeof Button>, 'type'> & { pendingLabel?: React.ReactNode; pending?: boolean; }) => React.JSX.Element; readonly FormErrors: ({ title, className }: { title?: React.ReactNode; className?: string; }) => React.JSX.Element | null; }>; }>>
```
