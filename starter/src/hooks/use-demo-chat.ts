// Coreloom UI — useDemoChat. A stand-in for the AI SDK's useChat, with the same shape (messages,
// status, error, sendMessage, stop, regenerate, addToolApprovalResponse, plus edit), that simulates
// a model in the browser: it thinks, calls a tool, then streams its answer word by word. Use it to
// prototype an AI screen with the Chat block before there is a backend; nothing leaves the page.
//
// With a real backend, swap it for useChat from @ai-sdk/react: the Chat block takes its messages
// and functions as they are.
import * as React from 'react'

import type { AiChatStatus, AiMessage, AiMessagePart, AiToolPart } from '@/lib/ai'

/** A tool call the simulated model makes. */
interface DemoTool {
  /** The tool's name: the part's type is `tool-<name>`. */
  name: string
  input: (question: string) => unknown
  output: unknown
}

/** What the simulated model says and does. Only `reasoning` and `answer` are required. */
interface DemoScript {
  /** What the model "thinks" before answering (streamed as a reasoning part). */
  reasoning: string
  /** The answer, in Markdown. `[1]` cites the first source. */
  answer: (question: string) => string
  /** The tool it calls before answering. Defaults to a docs search. */
  tool?: DemoTool
  /** The source it cites after answering. Leave out for none. */
  source?: { url: string; title: string }
  /** A question matching this asks to run `sensitiveTool`, which waits for approval. */
  sensitive?: RegExp
  /** The tool that needs approval. Defaults to a rollback. */
  sensitiveTool?: DemoTool
  /** The answer after Allow, and after Deny. */
  approved?: string
  denied?: string
  /** Milliseconds between two streamed words (default 28) and before the first token (650). */
  speed?: { word?: number; firstToken?: number }
}

const SEARCH_DOCS: DemoTool = {
  name: 'searchDocs',
  input: (question) => ({ query: question.slice(0, 60) }),
  output: { hits: 3 },
}

const ROLLBACK: DemoTool = {
  name: 'rollback',
  input: () => ({ project: 'coreloom-api', deployment: 'dpl_5t3q' }),
  output: { status: 'rolled back' },
}

class Stopped extends Error {}

function useDemoChat({
  initialMessages = [],
  script,
  onFinish,
}: {
  initialMessages?: AiMessage[]
  script: DemoScript
  onFinish?: (messages: AiMessage[]) => void
}) {
  // eslint-disable-next-line @eslint-react/use-state -- setMessages (below) wraps this setter and also updates `latest`.
  const [messages, setMessagesState] = React.useState<AiMessage[]>(initialMessages)
  const [status, setStatus] = React.useState<AiChatStatus>('ready')
  const [error, setError] = React.useState<Error>()
  const latest = React.useRef(messages)
  const run = React.useRef(0)
  const finish = React.useRef(onFinish)
  // The latest onFinish, read when a reply ends (not during render).
  // eslint-disable-next-line react-hooks/refs -- the usual "latest callback" ref, written on every render on purpose.
  finish.current = onFinish

  const setMessages = React.useCallback((next: AiMessage[]) => {
    latest.current = next
    setMessagesState(next)
  }, [])

  // Every wait checks that this reply is still the current one: Stop (or a new message) ends it.
  const sleep = (ms: number, id: number) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (run.current === id) resolve()
        else reject(new Stopped())
      }, ms),
    )

  const update = (id: string, change: (parts: AiMessagePart[]) => AiMessagePart[]) => {
    setMessages(
      latest.current.map((m) => (m.id === id ? { ...m, parts: change([...m.parts]) } : m)),
    )
  }

  const streamText = async (
    msgId: string,
    type: 'text' | 'reasoning',
    text: string,
    id: number,
  ) => {
    const words = text.split(/(\s+)/)
    let shown = ''
    update(msgId, (parts) => [...parts, { type, text: '', state: 'streaming' }])
    for (let i = 0; i < words.length; i += 2) {
      await sleep(script.speed?.word ?? 28, id)
      shown += words.slice(i, i + 2).join('')
      update(msgId, (parts) => [...parts.slice(0, -1), { type, text: shown, state: 'streaming' }])
    }
    update(msgId, (parts) => [...parts.slice(0, -1), { type, text, state: 'done' }])
  }

  const setTool = (msgId: string, toolCallId: string, change: Partial<AiToolPart>) => {
    update(msgId, (parts) =>
      parts.map((p) => ((p as AiToolPart).toolCallId === toolCallId ? { ...p, ...change } : p)),
    )
  }

  /** Thinks, then either calls a tool and answers, or asks before a sensitive tool. */
  const reply = async (question: string) => {
    const id = ++run.current
    const msgId = `a${Date.now()}`
    setError(undefined)
    setStatus('submitted')
    try {
      await sleep(script.speed?.firstToken ?? 650, id)
      setMessages([
        ...latest.current,
        { id: msgId, role: 'assistant', parts: [{ type: 'step-start' }] },
      ])
      setStatus('streaming')
      await streamText(msgId, 'reasoning', script.reasoning, id)

      if (script.sensitive?.test(question)) {
        // Like the AI SDK: the stream ends on a tool that needs approval; answering resumes it.
        const tool = script.sensitiveTool ?? ROLLBACK
        update(msgId, (parts) => [
          ...parts,
          {
            type: `tool-${tool.name}`,
            toolCallId: `${msgId}-t`,
            state: 'approval-requested',
            input: tool.input(question),
            approval: { id: `${msgId}-ok` },
          },
        ])
        setStatus('ready')
        return
      }

      const tool = script.tool ?? SEARCH_DOCS
      const toolCallId = `${msgId}-t`
      update(msgId, (parts) => [
        ...parts,
        {
          type: `tool-${tool.name}`,
          toolCallId,
          state: 'input-available',
          input: tool.input(question),
        },
      ])
      await sleep(900, id)
      setTool(msgId, toolCallId, { state: 'output-available', output: tool.output })
      // The source arrives with the answer, so its [1] marker becomes a citation as it streams.
      const source = script.source
      if (source)
        update(msgId, (parts) => [
          ...parts,
          { type: 'source-url', sourceId: `${msgId}-s`, url: source.url, title: source.title },
        ])
      await streamText(msgId, 'text', script.answer(question), id)
      setStatus('ready')
      finish.current?.(latest.current)
    } catch (e) {
      if (!(e instanceof Stopped)) {
        setError(e as Error)
        setStatus('error')
      }
    }
  }

  const sendMessage = ({ text }: { text: string; files?: File[] }) => {
    setMessages([
      ...latest.current,
      { id: `u${Date.now()}`, role: 'user', parts: [{ type: 'text', text }] },
    ])
    void reply(text)
  }

  /** Edits a sent message: what came after it goes, and the answer is written again (like setMessages + sendMessage). */
  const edit = (messageId: string, text: string) => {
    const at = latest.current.findIndex((m) => m.id === messageId)
    if (at < 0) return
    run.current++
    setMessages([
      ...latest.current.slice(0, at),
      { ...latest.current[at], parts: [{ type: 'text', text }] },
    ])
    void reply(text)
  }

  const stop = () => {
    run.current++
    // Close whatever was streaming, as the SDK does when the request is aborted.
    setMessages(
      latest.current.map((m) => ({
        ...m,
        parts: m.parts.map((p) =>
          (p as { state?: string }).state === 'streaming' ? { ...p, state: 'done' } : p,
        ),
      })),
    )
    setStatus('ready')
    finish.current?.(latest.current)
  }

  const regenerate = () => {
    const all = latest.current
    const lastUser = [...all].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    setMessages(all.slice(0, all.indexOf(lastUser) + 1))
    const text = lastUser.parts.find((p) => p.type === 'text') as { text: string } | undefined
    void reply(text?.text ?? '')
  }

  const addToolApprovalResponse = async ({
    id: approvalId,
    approved,
  }: {
    id: string
    approved: boolean
  }) => {
    const msg = latest.current.find((m) =>
      m.parts.some((p) => (p as AiToolPart).approval?.id === approvalId),
    )
    const part = msg?.parts.find((p) => (p as AiToolPart).approval?.id === approvalId) as
      AiToolPart | undefined
    if (!msg || !part) return
    const id = ++run.current
    setTool(msg.id, part.toolCallId, {
      state: 'approval-responded',
      approval: { id: approvalId, approved },
    })
    setStatus('streaming')
    try {
      if (approved) {
        await sleep(1200, id)
        setTool(msg.id, part.toolCallId, {
          state: 'output-available',
          output: (script.sensitiveTool ?? ROLLBACK).output,
        })
      } else {
        setTool(msg.id, part.toolCallId, { state: 'output-denied' })
      }
      await streamText(msg.id, 'text', (approved ? script.approved : script.denied) ?? '', id)
      setStatus('ready')
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
    [],
  )

  return { messages, status, error, sendMessage, stop, regenerate, edit, addToolApprovalResponse }
}

export { type DemoScript, type DemoTool, useDemoChat }
