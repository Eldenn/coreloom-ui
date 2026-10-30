// Coreloom UI — the message shapes the AI blocks read. They mirror the AI SDK's UIMessage (v5 and
// later: `parts` with text, reasoning, tools, files, sources), so `useChat().messages` goes straight
// in, without making the AI SDK a dependency. Parts the blocks don't know are skipped.

/** The status `useChat()` reports: waiting for the first token, streaming, idle, or failed. */
export type AiChatStatus = "submitted" | "streaming" | "ready" | "error"

export type AiTextPart = { type: "text"; text: string; state?: "streaming" | "done" }
export type AiReasoningPart = { type: "reasoning"; text: string; state?: "streaming" | "done" }
export type AiFilePart = { type: "file"; mediaType: string; url: string; filename?: string }
export type AiSourceUrlPart = { type: "source-url"; sourceId: string; url: string; title?: string }
export type AiSourceDocumentPart = { type: "source-document"; sourceId: string; title: string; filename?: string; mediaType?: string }

export type AiToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

/** A tool call: `tool-<name>` parts and `dynamic-tool` parts (with `toolName`). */
export type AiToolPart = {
  type: `tool-${string}` | "dynamic-tool"
  toolName?: string
  toolCallId: string
  title?: string
  state: AiToolState
  input?: unknown
  output?: unknown
  errorText?: string
  approval?: { id: string; approved?: boolean; reason?: string; requestReason?: string }
}

/** Any part: the known ones above, or another kind (data-*, step-start…) the blocks skip. */
export type AiMessagePart =
  | AiTextPart
  | AiReasoningPart
  | AiFilePart
  | AiSourceUrlPart
  | AiSourceDocumentPart
  | AiToolPart
  | { type: string; [key: string]: unknown }

/** Any message with an id, a role and parts — `UIMessage` from the AI SDK fits. */
export type AiMessage = {
  id: string
  role: "system" | "user" | "assistant"
  parts: ReadonlyArray<AiMessagePart>
}

export const isTextPart = (p: AiMessagePart): p is AiTextPart => p.type === "text"
export const isReasoningPart = (p: AiMessagePart): p is AiReasoningPart => p.type === "reasoning"
export const isFilePart = (p: AiMessagePart): p is AiFilePart => p.type === "file"
export const isSourcePart = (p: AiMessagePart): p is AiSourceUrlPart | AiSourceDocumentPart =>
  p.type === "source-url" || p.type === "source-document"
export const isToolPart = (p: AiMessagePart): p is AiToolPart => p.type === "dynamic-tool" || p.type.startsWith("tool-")

/** The tool's name: `tool-searchDocs` → "searchDocs", or `toolName` on dynamic tools. */
export function toolName(part: AiToolPart) {
  return part.type === "dynamic-tool" ? (part.toolName ?? "tool") : part.type.slice("tool-".length)
}

/** The message's text, joined: what "Copy" copies. */
export function messageText(message: AiMessage) {
  return message.parts
    .filter(isTextPart)
    .map((p) => p.text)
    .join("\n\n")
}

/** A model a block can offer (agents, playground, prompt toolbar). */
export type AiModel = {
  id: string
  name: string
  /** "Anthropic", "OpenAI", "Mistral"… */
  provider?: string
  /** Short note shown under the name: "Fast, cheap", "Best reasoning". */
  description?: string
}

/** Formats a cost in a currency (default USD) with enough decimals for fractions of a cent. */
export function formatCost(value: number, locale: string, currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
  }).format(value)
}

/** 950 → "950 ms", 12_400 → "12.4 s", 125_000 → "2 min 5 s". */
export function formatDuration(ms: number, locale: string) {
  const n = (v: number, unit: "millisecond" | "second" | "minute", digits = 0) =>
    new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "narrow", maximumFractionDigits: digits }).format(v)
  if (ms < 1000) return n(Math.round(ms), "millisecond")
  if (ms < 60_000) return n(ms / 1000, "second", ms < 10_000 ? 1 : 0)
  const min = Math.floor(ms / 60_000)
  const s = Math.round((ms % 60_000) / 1000)
  return s ? `${n(min, "minute")} ${n(s, "second")}` : n(min, "minute")
}
