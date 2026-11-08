# @coreloom/workflow-builder

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/workflow-builder.tsx

```ts
function WorkflowBuilder
WorkflowBuilder.kinds: NodeKind[]
WorkflowBuilder.value?: Workflow | undefined
WorkflowBuilder.defaultValue?: Workflow | undefined
WorkflowBuilder.onValueChange?: ((workflow: Workflow) => void) | undefined
WorkflowBuilder.name?: string | undefined
WorkflowBuilder.defaultName?: string | undefined
WorkflowBuilder.onNameChange?: ((name: string) => void) | undefined
WorkflowBuilder.onSave?: ((workflow: Workflow, name: string) => Promise<unknown> | undefined) | undefined
WorkflowBuilder.onRun?: ((workflow: Workflow) => void) | undefined
WorkflowBuilder.running?: boolean | undefined
WorkflowBuilder.runs?: Partial<Record<string, NodeRun>> | undefined
WorkflowBuilder.readOnly?: boolean | undefined
WorkflowBuilder.actions?: React.ReactNode
WorkflowBuilder.height?: number | undefined
WorkflowBuilder.className?: string | undefined
WorkflowBuilder.editorProps?: Omit<NodeEditorProps, 'height' | 'value' | 'defaultValue' | 'onValueChange' | 'readOnly' | 'actions' | 'kinds' | 'runs'> | undefined
```
