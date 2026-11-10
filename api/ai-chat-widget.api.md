# @coreloom/ai-chat-widget

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-chat-widget.tsx

```ts
function ChatWidget
ChatWidget.accept?: string | undefined
ChatWidget.error?: string | Error | null | undefined
ChatWidget.tools?: import("./ui/tool-call").ToolComponents<Record<string, { input: unknown; output: unknown; }>> | undefined
ChatWidget.status?: import("../lib/ai").AiChatStatus | undefined
ChatWidget.toolbar?: React.ReactNode
ChatWidget.messages: readonly import("../lib/ai").AiMessage[]
ChatWidget.onSend: (message: { text: string; files: File[]; }) => void
ChatWidget.onStop?: (() => void) | undefined
ChatWidget.onRegenerate?: (() => void) | undefined
ChatWidget.feedback?: Record<string, import("@/components/ai-chat").Feedback | undefined> | undefined
ChatWidget.onFeedback?: ((messageId: string, feedback: import("@/components/ai-chat").Feedback | undefined) => void) | undefined
ChatWidget.suggestions?: string[] | undefined
ChatWidget.emptyTitle?: React.ReactNode
ChatWidget.emptyDescription?: React.ReactNode
ChatWidget.allowAttachments?: boolean | undefined
ChatWidget.placeholder?: string | undefined
ChatWidget.onEdit?: ((messageId: string, text: string) => void) | undefined
ChatWidget.branches?: Record<string, import("@/components/ai-chat").Branch | undefined> | undefined
ChatWidget.onBranchChange?: ((messageId: string, index: number) => void) | undefined
ChatWidget.toolLabels?: Record<string, React.ReactNode> | undefined
ChatWidget.renderToolOutput?: ((toolName: string, output: unknown) => React.ReactNode | undefined) | undefined
ChatWidget.onToolApprovalResponse?: ((response: { id: string; approved: boolean; }) => void) | undefined
ChatWidget.onToolOutput?: import("./ui/tool-call").ToolCallback<import("./ui/tool-call").ToolOutputResponse> | undefined
ChatWidget.renderData?: ((part: import("../lib/ai").AiDataPart) => React.ReactNode) | undefined
ChatWidget.assistantAvatar?: Pick<{ name?: string; state?: import("./ui/agent-avatar").AgentAvatarState; variant?: import("./ui/agent-avatar").AgentAvatarVariant; shape?: import("./ui/agent-avatar").AgentAvatarShape | 'seed'; seed?: string; tone?: import("./ui/agent-avatar").AgentAvatarTone; eyes?: import("./ui/agent-avatar").AgentAvatarEyes; size?: import("./ui/agent-avatar").AgentAvatarSize; animated?: boolean; decorative?: boolean; } & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'>, 'shape' | 'variant' | 'tone' | 'seed' | 'eyes'> | undefined
ChatWidget.open?: boolean | undefined
ChatWidget.defaultOpen?: boolean | undefined
ChatWidget.onOpenChange?: ((open: boolean) => void) | undefined
ChatWidget.title?: React.ReactNode
ChatWidget.subtitle?: React.ReactNode
ChatWidget.avatar?: React.ReactNode
ChatWidget.presence?: ChatWidgetPresence | undefined
ChatWidget.unread?: number | undefined
ChatWidget.greeting?: React.ReactNode
ChatWidget.onGreetingDismiss?: (() => void) | undefined
ChatWidget.onClose?: (() => void) | undefined
ChatWidget.side?: 'left' | 'right' | undefined
ChatWidget.offset?: number | { x: number; y: number; } | undefined
ChatWidget.zIndex?: number | undefined
ChatWidget.fullScreen?: boolean | undefined
ChatWidget.className?: string | undefined
type ChatWidgetPresence = 'offline' | 'away' | 'online'
type ChatWidgetProps = Omit<{ messages: readonly import("../lib/ai").AiMessage[]; status?: import("../lib/ai").AiChatStatus; error?: Error | string | null; onSend: (message: { text: string; files: File[]; }) => void; onStop?: () => void; onRegenerate?: () => void; feedback?: Record<string, import("@/components/ai-chat").Feedback | undefined>; onFeedback?: (messageId: string, feedback: import("@/components/ai-chat").Feedback | undefined) => void; suggestions?: string[]; emptyTitle?: React.ReactNode; emptyDescription?: React.ReactNode; toolbar?: React.ReactNode; allowAttachments?: boolean; accept?: string; placeholder?: string; header?: React.ReactNode; autoFocus?: boolean; className?: string; } & MessageOptions & ToolOptions & AvatarOptions, 'header' | 'className' | 'autoFocus'> & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; title?: React.ReactNode; subtitle?: React.ReactNode; avatar?: React.ReactNode; presence?: ChatWidgetPresence; unread?: number; greeting?: React.ReactNode; onGreetingDismiss?: () => void; onClose?: () => void; side?: 'left' | 'right'; offset?: number | { x: number; y: number; }; zIndex?: number; fullScreen?: boolean; className?: string; }
```
