# @coreloom/emoji-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/emoji-picker.tsx

```ts
const defaultEmojis: Emoji[]
type Emoji = {}
Emoji.emoji: string
Emoji.name: string
Emoji.keywords?: string[] | undefined
Emoji.category: EmojiCategory
type EmojiCategory = 'smileys' | 'people' | 'nature' | 'food' | 'activities' | 'travel' | 'objects' | 'symbols'
function EmojiPicker
EmojiPicker.onSelect: (emoji: Emoji) => void
EmojiPicker.emojis?: Emoji[] | undefined
EmojiPicker.label?: string | undefined
EmojiPicker.disabled?: boolean | undefined
EmojiPicker.className?: string | undefined
EmojiPicker.children?: React.ReactNode
function EmojiPickerPanel
EmojiPickerPanel.onSelect: (emoji: Emoji) => void
EmojiPickerPanel.emojis?: Emoji[] | undefined
EmojiPickerPanel.className?: string | undefined
```
