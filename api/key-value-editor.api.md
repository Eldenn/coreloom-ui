# @coreloom/key-value-editor

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/key-value-editor.tsx

```ts
function KeyValueEditor
KeyValueEditor.value?: KeyValuePair[] | undefined
KeyValueEditor.defaultValue?: KeyValuePair[] | undefined
KeyValueEditor.onValueChange?: ((pairs: KeyValuePair[]) => void) | undefined
KeyValueEditor.keyLabel?: string | undefined
KeyValueEditor.valueLabel?: string | undefined
KeyValueEditor.keyPlaceholder?: string | undefined
KeyValueEditor.valuePlaceholder?: string | undefined
KeyValueEditor.addLabel?: string | undefined
KeyValueEditor.maxRows?: number | undefined
KeyValueEditor.sensitive?: boolean | undefined
KeyValueEditor.disabled?: boolean | undefined
KeyValueEditor.className?: string | undefined
KeyValueEditor.aria-label?: string | undefined
KeyValueEditor.aria-labelledby?: string | undefined
KeyValueEditor.aria-describedby?: string | undefined
type KeyValuePair = {}
KeyValuePair.key: string
KeyValuePair.value: string
function parseKeyValueLines(text: string) => KeyValuePair[] | undefined
```
