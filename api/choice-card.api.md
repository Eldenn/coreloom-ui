# @coreloom/choice-card

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/choice-card.tsx

```ts
function CheckboxCard
CheckboxCard.checked?: boolean | undefined
CheckboxCard.defaultChecked?: boolean | undefined
CheckboxCard.onCheckedChange?: ((checked: boolean) => void) | undefined
CheckboxCard.title: React.ReactNode
CheckboxCard.description?: React.ReactNode
CheckboxCard.icon?: React.ReactNode
CheckboxCard.name?: string | undefined
CheckboxCard.value?: string | undefined
CheckboxCard.disabled?: boolean | undefined
CheckboxCard.className?: string | undefined
CheckboxCard.children?: React.ReactNode
CheckboxCard.aria-invalid?: boolean | 'true' | 'false' | undefined
function RadioCard
RadioCard.value: string
RadioCard.title: React.ReactNode
RadioCard.description?: React.ReactNode
RadioCard.icon?: React.ReactNode
RadioCard.disabled?: boolean | undefined
RadioCard.className?: string | undefined
RadioCard.children?: React.ReactNode
function RadioCardGroup
RadioCardGroup.value?: string | undefined
RadioCardGroup.defaultValue?: string | undefined
RadioCardGroup.onValueChange?: ((value: string) => void) | undefined
RadioCardGroup.name?: string | undefined
RadioCardGroup.disabled?: boolean | undefined
RadioCardGroup.orientation?: 'vertical' | 'horizontal' | undefined
RadioCardGroup.className?: string | undefined
RadioCardGroup.children: React.ReactNode
RadioCardGroup.aria-label?: string | undefined
RadioCardGroup.aria-labelledby?: string | undefined
RadioCardGroup.aria-describedby?: string | undefined
RadioCardGroup.aria-invalid?: boolean | 'true' | 'false' | undefined
```
