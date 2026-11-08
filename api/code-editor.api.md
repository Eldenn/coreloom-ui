# @coreloom/code-editor

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/code-editor.tsx

```ts
const CODE_EDITOR_LANGUAGES: readonly { value: CodeEditorLanguage; label: string | null; }[]
function CodeEditor
CodeEditor.value?: string | undefined
CodeEditor.defaultValue?: string | undefined
CodeEditor.onValueChange?: ((value: string) => void) | undefined
CodeEditor.onChange?: ((value: string) => void) | undefined // deprecated
CodeEditor.language?: CodeEditorLanguage | undefined
CodeEditor.path?: string | undefined
CodeEditor.readOnly?: boolean | undefined
CodeEditor.lineNumbers?: boolean | undefined
CodeEditor.folding?: boolean | undefined
CodeEditor.wrap?: boolean | undefined
CodeEditor.tabSize?: number | undefined
CodeEditor.placeholder?: string | undefined
CodeEditor.diagnostics?: readonly CodeEditorDiagnostic[] | undefined
CodeEditor.onSave?: ((value: string) => void) | undefined
CodeEditor.onCursorChange?: ((cursor: CodeEditorCursor) => void) | undefined
CodeEditor.extensions?: readonly Extension[] | undefined
CodeEditor.height?: string | undefined
CodeEditor.minHeight?: string | undefined
CodeEditor.maxHeight?: string | undefined
CodeEditor.autoFocus?: boolean | undefined
CodeEditor.onViewChange?: ((view: EditorView | null) => void) | undefined
CodeEditor.className?: string | undefined
CodeEditor.aria-label?: string | undefined
CodeEditor.aria-labelledby?: string | undefined
CodeEditor.aria-describedby?: string | undefined
CodeEditor.aria-invalid?: boolean | undefined
CodeEditor.id?: string | undefined
type CodeEditorCursor = {}
CodeEditorCursor.line: number
CodeEditorCursor.column: number
CodeEditorCursor.selected: number
type CodeEditorDiagnostic = {}
CodeEditorDiagnostic.line: number
CodeEditorDiagnostic.column?: number | undefined
CodeEditorDiagnostic.endLine?: number | undefined
CodeEditorDiagnostic.endColumn?: number | undefined
CodeEditorDiagnostic.severity: 'error' | 'info' | 'warning'
CodeEditorDiagnostic.message: string
CodeEditorDiagnostic.source?: string | undefined
type CodeEditorLanguage = 'text' | 'json' | 'html' | 'markdown' | 'javascript' | 'jsx' | 'typescript' | 'tsx' | 'css' | 'python'
function CodeEditorLanguageSelect
CodeEditorLanguageSelect.value?: CodeEditorLanguage | undefined
CodeEditorLanguageSelect.defaultValue?: CodeEditorLanguage | undefined
CodeEditorLanguageSelect.onValueChange?: ((language: CodeEditorLanguage) => void) | undefined
CodeEditorLanguageSelect.languages?: readonly CodeEditorLanguage[] | undefined
CodeEditorLanguageSelect.size?: 'sm' | 'default' | undefined
CodeEditorLanguageSelect.disabled?: boolean | undefined
CodeEditorLanguageSelect.className?: string | undefined
CodeEditorLanguageSelect.aria-label?: string | undefined
type CodeEditorProps = {}
CodeEditorProps.value?: string | undefined
CodeEditorProps.defaultValue?: string | undefined
CodeEditorProps.onValueChange?: ((value: string) => void) | undefined
CodeEditorProps.onChange?: ((value: string) => void) | undefined // deprecated
CodeEditorProps.language?: CodeEditorLanguage | undefined
CodeEditorProps.path?: string | undefined
CodeEditorProps.readOnly?: boolean | undefined
CodeEditorProps.lineNumbers?: boolean | undefined
CodeEditorProps.folding?: boolean | undefined
CodeEditorProps.wrap?: boolean | undefined
CodeEditorProps.tabSize?: number | undefined
CodeEditorProps.placeholder?: string | undefined
CodeEditorProps.diagnostics?: readonly CodeEditorDiagnostic[] | undefined
CodeEditorProps.onSave?: ((value: string) => void) | undefined
CodeEditorProps.onCursorChange?: ((cursor: CodeEditorCursor) => void) | undefined
CodeEditorProps.extensions?: readonly Extension[] | undefined
CodeEditorProps.height?: string | undefined
CodeEditorProps.minHeight?: string | undefined
CodeEditorProps.maxHeight?: string | undefined
CodeEditorProps.autoFocus?: boolean | undefined
CodeEditorProps.onViewChange?: ((view: EditorView | null) => void) | undefined
CodeEditorProps.className?: string | undefined
CodeEditorProps.aria-label?: string | undefined
CodeEditorProps.aria-labelledby?: string | undefined
CodeEditorProps.aria-describedby?: string | undefined
CodeEditorProps.aria-invalid?: boolean | undefined
CodeEditorProps.id?: string | undefined
function diagnosticsToOffsets(doc: CmText, diagnostics: readonly CodeEditorDiagnostic[]) => Diagnostic[]
function languageFromPath(path: string) => CodeEditorLanguage
function useLanguageName() => (language: CodeEditorLanguage) => string
```
