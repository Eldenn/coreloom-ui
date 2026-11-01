// The AI SDK compatibility check. The AI blocks never import `ai`: they read its shapes through the
// structural types in src/lib/ai.ts. This file is what keeps those types honest. It hands the SDK's
// own types (ai is a devDependency, used only here and in ai.test.ts) to the blocks' props, so an SDK
// release that renames a field, adds a tool state or changes a callback fails `pnpm typecheck`
// instead of breaking apps silently. The runtime cases check the helpers read SDK-shaped values.
import type {
  ChatAddToolApproveResponseFunction,
  ChatAddToolOutputFunction,
  ChatStatus,
  DataUIPart,
  DynamicToolUIPart,
  FileUIPart,
  InferUITools,
  LanguageModelUsage,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  Tool,
  ToolUIPart,
  UIMessage,
  UIMessagePart,
} from 'ai'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Chat, ChatMessage, ChatMessages } from '@/components/ai-chat'
import type { ChatWidget } from '@/components/ai-chat-widget'
import type { ContextMeter } from '@/components/ui/context-meter'
import type { CitationSource } from '@/components/ui/inline-citation'
import type { PromptInput } from '@/components/ui/prompt-input'
import type { ToolCall, ToolComponents, ToolRenderProps } from '@/components/ui/tool-call'
import {
  type AiChatStatus,
  type AiDataPart,
  type AiMessage,
  type AiToolPart,
  type AiToolState,
  isDataPart,
  isFilePart,
  isReasoningPart,
  isSourcePart,
  isTextPart,
  isToolPart,
  messageText,
  planProgress,
  readPlan,
  toolName,
  usageDetails,
  usageTotal,
} from '@/lib/ai'

type Props<C> = C extends (props: infer P) => unknown ? P : never

// An app's tools, the way the SDK infers them from `tool({ inputSchema, execute })` on the server.
// Type aliases, not interfaces: the SDK's UITools needs the implicit index signature.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WeatherOutput = { city: string; celsius: number; sky: 'sun' | 'rain' }
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type AppTools = {
  getWeather: Tool<{ city: string }, WeatherOutput>
  searchDocs: Tool<{ query: string }, { title: string; url: string }[]>
}
type AppUITools = InferUITools<AppTools>
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type AppData = { progress: { step: number; of: number } }
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type AppMetadata = { model: string; createdAt: number }
type AppMessage = UIMessage<AppMetadata, AppData, AppUITools>

describe('AI SDK types go into the blocks as they are', () => {
  it('messages: plain and typed UIMessage, in Chat, ChatMessages, ChatMessage and ChatWidget', () => {
    expectTypeOf<UIMessage[]>().toExtend<Props<typeof Chat>['messages']>()
    expectTypeOf<AppMessage[]>().toExtend<Props<typeof Chat>['messages']>()
    expectTypeOf<AppMessage[]>().toExtend<Props<typeof ChatMessages>['messages']>()
    expectTypeOf<AppMessage>().toExtend<Props<typeof ChatMessage>['message']>()
    expectTypeOf<AppMessage[]>().toExtend<Props<typeof ChatWidget>['messages']>()
  })

  it('status: useChat().status in Chat, ChatMessages and PromptInput', () => {
    expectTypeOf<ChatStatus>().toEqualTypeOf<AiChatStatus>()
    expectTypeOf<ChatStatus>().toExtend<NonNullable<Props<typeof Chat>['status']>>()
    expectTypeOf<ChatStatus>().toExtend<NonNullable<Props<typeof ChatMessages>['status']>>()
    expectTypeOf<ChatStatus>().toExtend<NonNullable<Props<typeof PromptInput>['status']>>()
  })

  it('error: useChat().error in Chat', () => {
    expectTypeOf<Error | undefined>().toExtend<Props<typeof Chat>['error']>()
  })

  it('tool parts: every typed and dynamic tool part in ToolCall', () => {
    expectTypeOf<ToolUIPart<AppUITools>>().toExtend<Props<typeof ToolCall>['part']>()
    expectTypeOf<ToolUIPart>().toExtend<Props<typeof ToolCall>['part']>()
    expectTypeOf<DynamicToolUIPart>().toExtend<Props<typeof ToolCall>['part']>()
  })

  it('tool states: the SDK has no state the blocks do not draw', () => {
    // ToolCall looks its icon and label up by state: a new SDK state must be added to AiToolState
    // (and to the locales' `ai.tool.states`) before it can reach the card.
    expectTypeOf<ToolUIPart<AppUITools>['state']>().toEqualTypeOf<AiToolState>()
    expectTypeOf<DynamicToolUIPart['state']>().toEqualTypeOf<AiToolState>()
  })

  it('approvals: addToolApprovalResponse wires straight to onToolApprovalResponse', () => {
    expectTypeOf<ChatAddToolApproveResponseFunction>().toExtend<
      NonNullable<Props<typeof Chat>['onToolApprovalResponse']>
    >()
    expectTypeOf<ChatAddToolApproveResponseFunction>().toExtend<
      NonNullable<Props<typeof ToolCall>['onApprovalResponse']>
    >()
  })

  it('tool outputs: addToolOutput wires straight to onToolOutput, typed or not', () => {
    expectTypeOf<ChatAddToolOutputFunction<UIMessage>>().toExtend<
      NonNullable<Props<typeof Chat>['onToolOutput']>
    >()
    expectTypeOf<ChatAddToolOutputFunction<AppMessage>>().toExtend<
      NonNullable<Props<typeof Chat>['onToolOutput']>
    >()
    expectTypeOf<ChatAddToolOutputFunction<AppMessage>>().toExtend<
      NonNullable<Props<typeof ToolCall>['onOutput']>
    >()
  })

  it('data parts: what renderData receives', () => {
    expectTypeOf<DataUIPart<AppData>>().toExtend<AiDataPart>()
    expectTypeOf<AiDataPart>().toEqualTypeOf<
      Parameters<NonNullable<Props<typeof Chat>['renderData']>>[0]
    >()
  })

  it('sources: source parts are what the citations read', () => {
    expectTypeOf<SourceUrlUIPart>().toExtend<CitationSource>()
    expectTypeOf<SourceDocumentUIPart>().toExtend<CitationSource>()
  })

  it('usage: LanguageModelUsage in ContextMeter', () => {
    expectTypeOf<LanguageModelUsage>().toExtend<Props<typeof ContextMeter>['used']>()
  })
})

describe("generative UI is typed from the app's tools", () => {
  it('a ToolComponents map built from InferUITools goes into Chat and ChatWidget', () => {
    expectTypeOf<ToolComponents<AppUITools>>().toExtend<NonNullable<Props<typeof Chat>['tools']>>()
    expectTypeOf<ToolComponents<AppUITools>>().toExtend<
      NonNullable<Props<typeof ChatWidget>['tools']>
    >()
  })

  it('narrows input and output by state', () => {
    type Weather = ToolRenderProps<AppUITools['getWeather']['input'], WeatherOutput>
    expectTypeOf<
      Extract<Weather, { state: 'output-available' }>['output']
    >().toEqualTypeOf<WeatherOutput>()
    expectTypeOf<
      Extract<
        Weather,
        { state: 'input-available' | 'approval-requested' | 'approval-responded' | 'output-denied' }
      >['input']
    >().toEqualTypeOf<{
      city: string
    }>()
    expectTypeOf<Extract<Weather, { state: 'input-streaming' }>['input']>().toEqualTypeOf<
      { city?: string } | undefined
    >()
    expectTypeOf<Extract<Weather, { state: 'output-error' }>['errorText']>().toBeString()
  })

  it('draws each state the SDK has', () => {
    expectTypeOf<ToolRenderProps['state']>().toEqualTypeOf<ToolUIPart['state']>()
  })
})

// One assistant turn with every kind of part the SDK streams, in the SDK's own type.
const reply: AppMessage = {
  id: 'm2',
  role: 'assistant',
  metadata: { model: 'claude', createdAt: 0 },
  parts: [
    { type: 'step-start' },
    { type: 'reasoning', text: 'Check the weather first.', state: 'done' },
    {
      type: 'tool-getWeather',
      toolCallId: 'c1',
      state: 'output-available',
      input: { city: 'Lyon' },
      output: { city: 'Lyon', celsius: 14, sky: 'rain' },
    },
    {
      type: 'tool-searchDocs',
      toolCallId: 'c2',
      state: 'approval-requested',
      input: { query: 'umbrella policy' },
      approval: { id: 'a1', requestReason: 'Searches the private wiki.' },
    },
    {
      type: 'dynamic-tool',
      toolName: 'sendEmail',
      toolCallId: 'c3',
      state: 'output-error',
      input: { to: 'ops@example.com' },
      errorText: 'Mailbox full',
    },
    { type: 'data-progress', id: 'p1', data: { step: 2, of: 3 } },
    { type: 'text', text: 'Rain in **Lyon** today [1].', state: 'done' },
    { type: 'source-url', sourceId: 's1', url: 'https://example.com/lyon', title: 'Lyon' },
    {
      type: 'source-document',
      sourceId: 's2',
      mediaType: 'application/pdf',
      title: 'Policy',
      filename: 'policy.pdf',
    },
    {
      type: 'file',
      mediaType: 'image/png',
      url: 'data:image/png;base64,AAAA',
      filename: 'map.png',
    },
  ] satisfies UIMessagePart<AppData, AppUITools>[],
}
const ours: AiMessage = reply

describe('the helpers read SDK messages', () => {
  it('finds each part by kind and skips the ones the blocks do not draw', () => {
    expect(ours.parts.filter(isTextPart)).toHaveLength(1)
    expect(ours.parts.filter(isReasoningPart)).toHaveLength(1)
    expect(ours.parts.filter(isSourcePart).map((p) => p.sourceId)).toEqual(['s1', 's2'])
    expect(ours.parts.filter(isFilePart).map((p) => p.filename)).toEqual(['map.png'])
    const known = [isTextPart, isReasoningPart, isSourcePart, isFilePart, isToolPart]
    expect(ours.parts.filter((p) => !known.some((is) => is(p))).map((p) => p.type)).toEqual([
      'step-start',
      'data-progress',
    ])
  })

  it('names typed and dynamic tools, and keeps their state, input, output and approval', () => {
    const tools = ours.parts.filter(isToolPart)
    expect(tools.map(toolName)).toEqual(['getWeather', 'searchDocs', 'sendEmail'])
    const [weather, search, email] = tools as [AiToolPart, AiToolPart, AiToolPart]
    expect(weather.output).toEqual({ city: 'Lyon', celsius: 14, sky: 'rain' })
    expect(search.approval).toEqual({ id: 'a1', requestReason: 'Searches the private wiki.' })
    expect(email.errorText).toBe('Mailbox full')
  })

  it('finds data parts, and reads a plan streamed as one', () => {
    expect(ours.parts.filter(isDataPart).map((p) => p.id)).toEqual(['p1'])
    const plan: DataUIPart<{ plan: { steps: { id: string; title: string; status: string }[] } }> = {
      type: 'data-plan',
      id: 'plan',
      data: {
        steps: [
          { id: 'a', title: 'Read the logs', status: 'completed' },
          { id: 'b', title: 'Find the bad build', status: 'in_progress' },
        ],
      },
    }
    const read = readPlan(plan.data)
    expect(read?.steps.map((s) => s.status)).toEqual(['done', 'running'])
    expect(read && planProgress(read).current?.title).toBe('Find the bad build')
  })

  it('copies the text parts only', () => {
    expect(messageText(ours)).toBe('Rain in **Lyon** today [1].')
  })

  it('reads LanguageModelUsage, details included', () => {
    const usage: LanguageModelUsage = {
      inputTokens: 1200,
      inputTokenDetails: { noCacheTokens: 200, cacheReadTokens: 1000, cacheWriteTokens: 0 },
      outputTokens: 300,
      outputTokenDetails: { textTokens: 180, reasoningTokens: 120 },
      totalTokens: 1500,
    }
    expect(usageTotal(usage)).toBe(1500)
    expect(usageDetails(usage)).toEqual({ reasoning: 120, cached: 1000 })
  })

  it('takes a file part as the composer would send it back', () => {
    const file: FileUIPart = { type: 'file', mediaType: 'text/plain', url: 'data:,hi' }
    expect(isFilePart(file)).toBe(true)
  })
})
