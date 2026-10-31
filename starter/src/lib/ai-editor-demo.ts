// The notes editor's AI, simulated: a canned rewrite of the text, streamed word by word, that stops
// when the request is aborted. With a backend, `onRequest` would stream your model's answer instead
// (e.g. fetch a route that calls streamText and yield its text chunks).
import type { RichTextAiRequest } from '@/components/ui/rich-text-editor'
import type { Messages } from '@/messages'

const sentences = (text: string) =>
  text
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text]

function rewrite(req: RichTextAiRequest, t: Messages['ai']['editor']) {
  const text = req.text.trim() || 'Notes'
  switch (req.action) {
    case 'shorten':
      return sentences(text)[0]
    case 'lengthen':
      return `${text} ${t.lengthen}`
    case 'summarise':
      return `${t.summary} ${sentences(text)[0]}`
    case 'translate':
      return `${t.translated(req.language ?? 'en')} ${text}`
    case 'fixGrammar':
      return text.replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase())
    default:
      return text.replace(/\s+/g, ' ')
  }
}

export function demoEditorAi(t: Messages['ai']['editor']) {
  return async function* onRequest(req: RichTextAiRequest): AsyncIterable<string> {
    const words = rewrite(req, t).split(/(\s+)/)
    for (const word of words) {
      if (req.signal.aborted) return
      await new Promise((resolve) => setTimeout(resolve, 35))
      yield word
    }
  }
}
