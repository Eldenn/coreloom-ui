// A stand-in for the AI SDK's useChat, with the same shape (messages, status, error, sendMessage,
// stop, regenerate, addToolApprovalResponse), that simulates a model locally: it thinks, calls a
// tool, then streams its answer word by word. Nothing leaves the browser.
//
// With a real backend, delete this file and use useChat from @ai-sdk/react instead — the Chat
// block takes its messages and functions as they are (see README → "AI pages").
import * as React from "react"

import type { AiChatStatus, AiMessage, AiMessagePart, AiToolPart } from "@/lib/ai"

export type DemoScript = {
  /** What the model "thinks" before answering. */
  reasoning: string
  /** The answer, in Markdown. */
  answer: (question: string) => string
  /** A question matching this asks to run a sensitive tool, which waits for approval. */
  sensitive: RegExp
  approved: string
  denied: string
}

class Stopped extends Error {}

export function useDemoChat({ initialMessages = [], script, onFinish }: { initialMessages?: AiMessage[]; script: DemoScript; onFinish?: (messages: AiMessage[]) => void }) {
  const [messages, setMessagesState] = React.useState<AiMessage[]>(initialMessages)
  const [status, setStatus] = React.useState<AiChatStatus>("ready")
  const [error, setError] = React.useState<Error>()
  const latest = React.useRef(messages)
  const run = React.useRef(0)
  const finish = React.useRef(onFinish)
  finish.current = onFinish

  const setMessages = React.useCallback((next: AiMessage[]) => {
    latest.current = next
    setMessagesState(next)
  }, [])

  // Every wait checks that this reply is still the current one: Stop (or a new message) ends it.
  const sleep = (ms: number, id: number) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => (run.current === id ? resolve() : reject(new Stopped())), ms)
    )

  const update = (id: string, change: (parts: AiMessagePart[]) => AiMessagePart[]) =>
    setMessages(latest.current.map((m) => (m.id === id ? { ...m, parts: change([...m.parts]) } : m)))

  const streamText = async (msgId: string, type: "text" | "reasoning", text: string, id: number) => {
    const words = text.split(/(\s+)/)
    let shown = ""
    update(msgId, (parts) => [...parts, { type, text: "", state: "streaming" }])
    for (let i = 0; i < words.length; i += 2) {
      await sleep(28, id)
      shown += words.slice(i, i + 2).join("")
      update(msgId, (parts) => [...parts.slice(0, -1), { type, text: shown, state: "streaming" }])
    }
    update(msgId, (parts) => [...parts.slice(0, -1), { type, text, state: "done" }])
  }

  const setTool = (msgId: string, toolCallId: string, change: Partial<AiToolPart>) =>
    update(msgId, (parts) => parts.map((p) => ((p as AiToolPart).toolCallId === toolCallId ? ({ ...p, ...change } as AiMessagePart) : p)))

  /** Thinks, then either calls a tool and answers, or asks before a sensitive tool. */
  const reply = async (question: string) => {
    const id = ++run.current
    const msgId = `a${Date.now()}`
    setError(undefined)
    setStatus("submitted")
    try {
      await sleep(650, id)
      setMessages([...latest.current, { id: msgId, role: "assistant", parts: [{ type: "step-start" }] }])
      setStatus("streaming")
      await streamText(msgId, "reasoning", script.reasoning, id)

      if (script.sensitive.test(question)) {
        // Like the AI SDK: the stream ends on a tool that needs approval; answering resumes it.
        update(msgId, (parts) => [...parts, { type: "tool-rollback", toolCallId: `${msgId}-t`, state: "approval-requested", input: { project: "coreloom-api", deployment: "dpl_5t3q" }, approval: { id: `${msgId}-ok` } }])
        setStatus("ready")
        return
      }

      const toolCallId = `${msgId}-t`
      update(msgId, (parts) => [...parts, { type: "tool-searchDocs", toolCallId, state: "input-available", input: { query: question.slice(0, 60) } }])
      await sleep(900, id)
      setTool(msgId, toolCallId, { state: "output-available", output: { hits: 3, top: "Deployments guide.md" } })
      await streamText(msgId, "text", script.answer(question), id)
      update(msgId, (parts) => [...parts, { type: "source-url", sourceId: `${msgId}-s`, url: "https://eldenn.github.io/coreloom-ui/", title: "Deployments guide" }])
      setStatus("ready")
      finish.current?.(latest.current)
    } catch (e) {
      if (!(e instanceof Stopped)) {
        setError(e as Error)
        setStatus("error")
      }
    }
  }

  const sendMessage = ({ text }: { text: string; files?: File[] }) => {
    setMessages([...latest.current, { id: `u${Date.now()}`, role: "user", parts: [{ type: "text", text }] }])
    void reply(text)
  }

  /** Edits a sent message: what came after it goes, and the answer is written again (like setMessages + sendMessage). */
  const edit = (messageId: string, text: string) => {
    const at = latest.current.findIndex((m) => m.id === messageId)
    if (at < 0) return
    run.current++
    setMessages([...latest.current.slice(0, at), { ...latest.current[at], parts: [{ type: "text", text }] }])
    void reply(text)
  }

  const stop = () => {
    run.current++
    // Close whatever was streaming, as the SDK does when the request is aborted.
    setMessages(latest.current.map((m) => ({ ...m, parts: m.parts.map((p) => ((p as { state?: string }).state === "streaming" ? { ...p, state: "done" } : p)) })))
    setStatus("ready")
    finish.current?.(latest.current)
  }

  const regenerate = () => {
    const all = latest.current
    const lastUser = [...all].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    setMessages(all.slice(0, all.indexOf(lastUser) + 1))
    const text = lastUser.parts.find((p) => p.type === "text") as { text: string } | undefined
    void reply(text?.text ?? "")
  }

  const addToolApprovalResponse = async ({ id: approvalId, approved }: { id: string; approved: boolean }) => {
    const msg = latest.current.find((m) => m.parts.some((p) => (p as AiToolPart).approval?.id === approvalId))
    const part = msg?.parts.find((p) => (p as AiToolPart).approval?.id === approvalId) as AiToolPart | undefined
    if (!msg || !part) return
    const id = ++run.current
    setTool(msg.id, part.toolCallId, { state: "approval-responded", approval: { id: approvalId, approved } })
    setStatus("streaming")
    try {
      if (approved) {
        await sleep(1200, id)
        setTool(msg.id, part.toolCallId, { state: "output-available", output: { status: "rolled back", to: "dpl_5t3q" } })
      } else {
        setTool(msg.id, part.toolCallId, { state: "output-denied" })
      }
      await streamText(msg.id, "text", approved ? script.approved : script.denied, id)
      setStatus("ready")
      finish.current?.(latest.current)
    } catch (e) {
      if (!(e instanceof Stopped)) throw e
    }
  }

  // Stop the simulation when the conversation closes.
  React.useEffect(
    () => () => {
      run.current++
    },
    []
  )

  return { messages, status, error, sendMessage, stop, regenerate, edit, addToolApprovalResponse }
}
