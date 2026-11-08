# @coreloom/ai-chat

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-chat.tsx

```ts
type Branch = {}
Branch.index: number
Branch.count: number
function Chat
Chat.messages: readonly AiMessage[]
Chat.status?: AiChatStatus | undefined
Chat.error?: string | Error | null | undefined
Chat.onSend: (message: { text: string; files: File[]; }) => void
Chat.onStop?: (() => void) | undefined
Chat.onRegenerate?: (() => void) | undefined
Chat.feedback?: Record<string, Feedback | undefined> | undefined
Chat.onFeedback?: ((messageId: string, feedback: Feedback | undefined) => void) | undefined
Chat.suggestions?: string[] | undefined
Chat.emptyTitle?: React.ReactNode
Chat.emptyDescription?: React.ReactNode
Chat.toolbar?: React.ReactNode
Chat.allowAttachments?: boolean | undefined
Chat.accept?: string | undefined
Chat.placeholder?: string | undefined
Chat.header?: React.ReactNode
Chat.autoFocus?: boolean | undefined
Chat.className?: string | undefined
Chat.onEdit?: ((messageId: string, text: string) => void) | undefined
Chat.branches?: Record<string, Branch | undefined> | undefined
Chat.onBranchChange?: ((messageId: string, index: number) => void) | undefined
Chat.tools?: ToolComponents<Record<string, { input: unknown; output: unknown; }>> | undefined
Chat.toolLabels?: Record<string, React.ReactNode> | undefined
Chat.renderToolOutput?: ((toolName: string, output: unknown) => React.ReactNode | undefined) | undefined
Chat.onToolApprovalResponse?: ((response: { id: string; approved: boolean; }) => void) | undefined
Chat.onToolOutput?: ToolCallback<ToolOutputResponse> | undefined
Chat.renderData?: ((part: AiDataPart) => React.ReactNode) | undefined
Chat.assistantAvatar?: Pick<{ name?: string; state?: import("@/components/ui/agent-avatar").AgentAvatarState; variant?: import("@/components/ui/agent-avatar").AgentAvatarVariant; shape?: import("@/components/ui/agent-avatar").AgentAvatarShape | 'seed'; seed?: string; tone?: import("@/components/ui/agent-avatar").AgentAvatarTone; eyes?: import("@/components/ui/agent-avatar").AgentAvatarEyes; size?: import("@/components/ui/agent-avatar").AgentAvatarSize; animated?: boolean; decorative?: boolean; } & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'>, 'shape' | 'variant' | 'tone' | 'seed' | 'eyes'> | undefined
function ChatEmpty
ChatEmpty.title?: React.ReactNode
ChatEmpty.description?: React.ReactNode
ChatEmpty.suggestions?: string[] | undefined
ChatEmpty.onSuggestion?: ((text: string) => void) | undefined
ChatEmpty.className?: string | undefined
function ChatMessage
ChatMessage.message: AiMessage
ChatMessage.streaming?: boolean | undefined
ChatMessage.isLast?: boolean | undefined
ChatMessage.feedback?: Feedback | undefined
ChatMessage.onFeedback?: ((messageId: string, feedback: Feedback | undefined) => void) | undefined
ChatMessage.onRegenerate?: (() => void) | undefined
ChatMessage.onEdit?: ((messageId: string, text: string) => void) | undefined
ChatMessage.branch?: Branch | undefined
ChatMessage.onBranchChange?: ((messageId: string, index: number) => void) | undefined
ChatMessage.busy?: boolean | undefined
ChatMessage.className?: string | undefined
ChatMessage.tools?: ToolComponents<Record<string, { input: unknown; output: unknown; }>> | undefined
ChatMessage.toolLabels?: Record<string, React.ReactNode> | undefined
ChatMessage.renderToolOutput?: ((toolName: string, output: unknown) => React.ReactNode | undefined) | undefined
ChatMessage.onToolApprovalResponse?: ((response: { id: string; approved: boolean; }) => void) | undefined
ChatMessage.onToolOutput?: ToolCallback<ToolOutputResponse> | undefined
ChatMessage.renderData?: ((part: AiDataPart) => React.ReactNode) | undefined
ChatMessage.assistantAvatar?: Pick<{ name?: string; state?: import("@/components/ui/agent-avatar").AgentAvatarState; variant?: import("@/components/ui/agent-avatar").AgentAvatarVariant; shape?: import("@/components/ui/agent-avatar").AgentAvatarShape | 'seed'; seed?: string; tone?: import("@/components/ui/agent-avatar").AgentAvatarTone; eyes?: import("@/components/ui/agent-avatar").AgentAvatarEyes; size?: import("@/components/ui/agent-avatar").AgentAvatarSize; animated?: boolean; decorative?: boolean; } & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'>, 'shape' | 'variant' | 'tone' | 'seed' | 'eyes'> | undefined
function ChatMessages
ChatMessages.messages: readonly AiMessage[]
ChatMessages.status?: AiChatStatus | undefined
ChatMessages.error?: string | Error | null | undefined
ChatMessages.onRetry?: (() => void) | undefined
ChatMessages.onRegenerate?: (() => void) | undefined
ChatMessages.feedback?: Record<string, Feedback | undefined> | undefined
ChatMessages.onFeedback?: ((messageId: string, feedback: Feedback | undefined) => void) | undefined
ChatMessages.className?: string | undefined
ChatMessages.onEdit?: ((messageId: string, text: string) => void) | undefined
ChatMessages.branches?: Record<string, Branch | undefined> | undefined
ChatMessages.onBranchChange?: ((messageId: string, index: number) => void) | undefined
ChatMessages.tools?: ToolComponents<Record<string, { input: unknown; output: unknown; }>> | undefined
ChatMessages.toolLabels?: Record<string, React.ReactNode> | undefined
ChatMessages.renderToolOutput?: ((toolName: string, output: unknown) => React.ReactNode | undefined) | undefined
ChatMessages.onToolApprovalResponse?: ((response: { id: string; approved: boolean; }) => void) | undefined
ChatMessages.onToolOutput?: ToolCallback<ToolOutputResponse> | undefined
ChatMessages.renderData?: ((part: AiDataPart) => React.ReactNode) | undefined
ChatMessages.assistantAvatar?: Pick<{ name?: string; state?: import("@/components/ui/agent-avatar").AgentAvatarState; variant?: import("@/components/ui/agent-avatar").AgentAvatarVariant; shape?: import("@/components/ui/agent-avatar").AgentAvatarShape | 'seed'; seed?: string; tone?: import("@/components/ui/agent-avatar").AgentAvatarTone; eyes?: import("@/components/ui/agent-avatar").AgentAvatarEyes; size?: import("@/components/ui/agent-avatar").AgentAvatarSize; animated?: boolean; decorative?: boolean; } & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'>, 'shape' | 'variant' | 'tone' | 'seed' | 'eyes'> | undefined
type Conversation = {}
Conversation.id: string
Conversation.title: string
Conversation.updatedAt: string | Date
function ConversationList
ConversationList.conversations: Conversation[]
ConversationList.activeId?: string | undefined
ConversationList.onSelect?: ((id: string) => void) | undefined
ConversationList.href?: ((id: string) => string) | undefined
ConversationList.onNew?: (() => void) | undefined
ConversationList.onRename?: ((id: string, title: string) => void) | undefined
ConversationList.onDelete?: ((id: string) => void) | undefined
ConversationList.now?: Date | undefined
ConversationList.className?: string | undefined
type Feedback = 'good' | 'bad'
```
