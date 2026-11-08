# @coreloom/tool-call

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/tool-call.tsx

```ts
function ToolCall
ToolCall.part: AiToolPart
ToolCall.label?: React.ReactNode
ToolCall.tool?: ToolComponent<unknown, unknown> | undefined
ToolCall.renderOutput?: ((output: unknown) => React.ReactNode | undefined) | undefined
ToolCall.onApprovalResponse?: ((response: { id: string; approved: boolean; }) => void) | undefined
ToolCall.onOutput?: ((arg: ToolOutputResponse) => void) | undefined
ToolCall.open?: boolean | undefined
ToolCall.defaultOpen?: boolean | undefined
ToolCall.onOpenChange?: ((open: boolean) => void) | undefined
ToolCall.className?: string | undefined
type ToolCallback<Arg> = (arg: Arg) => void
type ToolComponent<Input = unknown, Output = unknown> = {}
ToolComponent.label?: React.ReactNode
ToolComponent.render: (props: ToolRenderProps<Input, Output>) => React.ReactNode
ToolComponent.display?: 'card' | 'inline' | undefined
ToolComponent.awaitsInput?: boolean | undefined
type ToolComponents<Tools extends { [K in keyof Tools]: { input: unknown; output: unknown } } = Record<
    string,
    { input: unknown; output: unknown }
  >> = { [K in keyof Tools]?: ToolComponent<Tools[K]['input'], Tools[K]['output']> | undefined; }
type ToolOutputResponse = { tool: string; toolCallId: string; state?: 'output-available'; output: unknown; } | { tool: string; toolCallId: string; state: 'output-error'; errorText: string; }
type ToolRenderProps<Input = unknown, Output = unknown> = ToolRenderState<Input, Output> & { toolCallId: string; part: AiToolPart; respond?: (approved: boolean) => void; submit?: ToolCallback<Output>; cancel?: (reason?: string) => void; }
type ToolRenderState<Input, Output> = { state: 'input-streaming'; input: PartialDeep<Input> | undefined; output?: undefined; } | { state: 'input-available' | 'approval-requested' | 'approval-responded' | 'output-denied'; input: Input; output?: undefined; } | { state: 'output-available'; input: Input; output: Output; } | { state: 'output-error'; input: Input | undefined; output?: undefined; errorText: string; }
```
