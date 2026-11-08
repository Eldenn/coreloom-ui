# @coreloom/ide

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ide.tsx

```ts
function checkFilePath(input: string, existing: readonly string[]) => { path: string; } | { error: 'empty' | 'invalid' | 'exists'; }
function fileTree(paths: readonly string[]) => TreeViewNode[]
function Ide
Ide.files?: IdeFile[] | undefined
Ide.defaultFiles?: IdeFile[] | undefined
Ide.onFilesChange?: ((files: IdeFile[]) => void) | undefined
Ide.defaultOpen?: string[] | undefined
Ide.defaultActive?: string | undefined
Ide.onSave?: ((file: IdeFile) => void | Promise<void>) | undefined
Ide.onRun?: ((files: IdeFile[], active: string | undefined) => void) | undefined
Ide.running?: boolean | undefined
Ide.diagnostics?: Record<string, CodeEditorDiagnostic[]> | undefined
Ide.panels?: IdePanel[] | undefined
Ide.panelOpen?: boolean | undefined
Ide.defaultPanelOpen?: boolean | undefined
Ide.onPanelOpenChange?: ((open: boolean) => void) | undefined
Ide.panel?: string | undefined
Ide.defaultPanel?: string | undefined
Ide.onPanelChange?: ((panel: string) => void) | undefined
Ide.title?: React.ReactNode
Ide.actions?: React.ReactNode
Ide.readOnly?: boolean | undefined
Ide.fileOperations?: boolean | undefined
Ide.defaultWrap?: boolean | undefined
Ide.tabSize?: number | undefined
Ide.className?: string | undefined
Ide.aria-label?: string | undefined
type IdeFile = {}
IdeFile.path: string
IdeFile.content: string
IdeFile.language?: CodeEditorLanguage | undefined
IdeFile.readOnly?: boolean | undefined
type IdePanel = {}
IdePanel.id: string
IdePanel.label: string
IdePanel.content: React.ReactNode
type IdeProps = {}
IdeProps.files?: IdeFile[] | undefined
IdeProps.defaultFiles?: IdeFile[] | undefined
IdeProps.onFilesChange?: ((files: IdeFile[]) => void) | undefined
IdeProps.defaultOpen?: string[] | undefined
IdeProps.defaultActive?: string | undefined
IdeProps.onSave?: ((file: IdeFile) => void | Promise<void>) | undefined
IdeProps.onRun?: ((files: IdeFile[], active: string | undefined) => void) | undefined
IdeProps.running?: boolean | undefined
IdeProps.diagnostics?: Record<string, CodeEditorDiagnostic[]> | undefined
IdeProps.panels?: IdePanel[] | undefined
IdeProps.panelOpen?: boolean | undefined
IdeProps.defaultPanelOpen?: boolean | undefined
IdeProps.onPanelOpenChange?: ((open: boolean) => void) | undefined
IdeProps.panel?: string | undefined
IdeProps.defaultPanel?: string | undefined
IdeProps.onPanelChange?: ((panel: string) => void) | undefined
IdeProps.title?: React.ReactNode
IdeProps.actions?: React.ReactNode
IdeProps.readOnly?: boolean | undefined
IdeProps.fileOperations?: boolean | undefined
IdeProps.defaultWrap?: boolean | undefined
IdeProps.tabSize?: number | undefined
IdeProps.className?: string | undefined
IdeProps.aria-label?: string | undefined
```
