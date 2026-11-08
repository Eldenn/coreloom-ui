# @coreloom/ai

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/ai.ts

```ts
function readPlan(value: unknown) => AiPlan | undefined
function planProgress(plan: AiPlan) => { finished: number; total: number; current: AiPlanStep | undefined; failed: AiPlanStep | undefined; complete: boolean; }
function toolName(part: AiToolPart) => string
function messageText(message: AiMessage) => string
function usageDetails(usage: AiUsage) => { reasoning: number | undefined; cached: number | undefined; }
function formatTokens(n: number, locale: string) => string
function formatTokenPrice(value: number, locale: string, currency?: string) => string
function usageTotal(usage: AiUsage | number) => number
function estimateCost(usage: AiUsage, pricing: { input: number; output: number; }) => number
function contextLevel(used: number, max: number) => 'ok' | 'warning' | 'critical'
function formatCost(value: number, locale: string, currency?: string) => string
function formatDuration(ms: number, locale: string) => string
type AiChatStatus = 'error' | 'submitted' | 'streaming' | 'ready'
type AiTextPart = {}
AiTextPart.type: 'text'
AiTextPart.text: string
AiTextPart.state?: 'done' | 'streaming' | undefined
type AiReasoningPart = {}
AiReasoningPart.type: 'reasoning'
AiReasoningPart.text: string
AiReasoningPart.state?: 'done' | 'streaming' | undefined
type AiFilePart = {}
AiFilePart.type: 'file'
AiFilePart.mediaType: string
AiFilePart.url: string
AiFilePart.filename?: string | undefined
type AiSourceUrlPart = {}
AiSourceUrlPart.type: 'source-url'
AiSourceUrlPart.sourceId: string
AiSourceUrlPart.url: string
AiSourceUrlPart.title?: string | undefined
type AiSourceDocumentPart = {}
AiSourceDocumentPart.type: 'source-document'
AiSourceDocumentPart.sourceId: string
AiSourceDocumentPart.title: string
AiSourceDocumentPart.filename?: string | undefined
AiSourceDocumentPart.mediaType?: string | undefined
type AiToolState = 'input-streaming' | 'input-available' | 'approval-requested' | 'approval-responded' | 'output-available' | 'output-error' | 'output-denied'
type AiToolPart = {}
AiToolPart.type: `tool-${string}` | 'dynamic-tool'
AiToolPart.toolName?: string | undefined
AiToolPart.toolCallId: string
AiToolPart.title?: string | undefined
AiToolPart.state: AiToolState
AiToolPart.input?: unknown
AiToolPart.output?: unknown
AiToolPart.errorText?: string | undefined
AiToolPart.approval?: {}
AiToolPart.approval.id: string
AiToolPart.approval.approved?: boolean | undefined
AiToolPart.approval.reason?: string | undefined
AiToolPart.approval.requestReason?: string | undefined
type AiDataPart<Data = unknown> = {}
AiDataPart.type: `data-${string}`
AiDataPart.id?: string | undefined
AiDataPart.data: Data
type AiPlanStepStatus = 'done' | 'running' | 'pending' | 'failed' | 'skipped'
type AiPlanStep = {}
AiPlanStep.id: string
AiPlanStep.title: string
AiPlanStep.status: AiPlanStepStatus
AiPlanStep.detail?: string | undefined
type AiPlan = {}
AiPlan.title?: string | undefined
AiPlan.steps: readonly AiPlanStep[]
type AiMessagePart = AiTextPart | AiReasoningPart | AiFilePart | AiSourceUrlPart | AiSourceDocumentPart | AiToolPart | AiDataPart<unknown> | { [key: string]: unknown; type: string; }
type AiMessage = {}
AiMessage.id: string
AiMessage.role: 'system' | 'user' | 'assistant'
AiMessage.parts: readonly AiMessagePart[]
function isTextPart(p: AiMessagePart) => p is AiTextPart
function isReasoningPart(p: AiMessagePart) => p is AiReasoningPart
function isFilePart(p: AiMessagePart) => p is AiFilePart
function isSourcePart(p: AiMessagePart) => p is AiSourceUrlPart | AiSourceDocumentPart
function isToolPart(p: AiMessagePart) => p is AiToolPart
function isDataPart(p: AiMessagePart) => p is AiDataPart
type AiModelCapability = 'vision' | 'tools' | 'reasoning' | 'fast' | 'files' | 'audio' | 'web'
type AiModel = {}
AiModel.id: string
AiModel.name: string
AiModel.provider?: string | undefined
AiModel.description?: string | undefined
AiModel.contextWindow?: number | undefined
AiModel.pricing?: {}
AiModel.pricing.input: number
AiModel.pricing.output: number
AiModel.pricing.currency?: string | undefined
AiModel.capabilities?: readonly (AiModelCapability | (string & {}))[] | undefined
AiModel.disabled?: boolean | undefined
type AiUsage = {}
AiUsage.inputTokens?: number | undefined
AiUsage.outputTokens?: number | undefined
AiUsage.totalTokens?: number | undefined
AiUsage.reasoningTokens?: number | undefined
AiUsage.cachedInputTokens?: number | undefined
AiUsage.inputTokenDetails?: {}
AiUsage.inputTokenDetails.cacheReadTokens?: number | undefined
AiUsage.outputTokenDetails?: {}
AiUsage.outputTokenDetails.reasoningTokens?: number | undefined
```
