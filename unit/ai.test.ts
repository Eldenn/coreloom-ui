import type { UIMessage } from "ai"
import { describe, expect, it } from "vitest"

import { promptVariables } from "@/components/ai-agents"
import { formatCost, formatDuration, isToolPart, messageText, toolName, type AiMessage, type AiToolPart } from "@/lib/ai"

// Type-level: the AI SDK's messages go into the blocks as they are (checked by `pnpm typecheck`).
type Tools = { searchDocs: { input: { query: string }; output: { hits: number } } }
const fromSdk: UIMessage<unknown, Record<string, unknown>, Tools> = {
  id: "m1",
  role: "assistant",
  parts: [
    { type: "step-start" },
    { type: "reasoning", text: "Look it up.", state: "done" },
    { type: "tool-searchDocs", toolCallId: "c1", state: "output-available", input: { query: "rollback" }, output: { hits: 3 } },
    { type: "text", text: "Found **3** pages.", state: "done" },
    { type: "source-url", sourceId: "s1", url: "https://coreloom.dev/docs" },
  ],
}
const asOurs: AiMessage = fromSdk
const many: ReadonlyArray<AiMessage> = [fromSdk] satisfies UIMessage<unknown, Record<string, unknown>, Tools>[]

describe("AI message helpers", () => {
  it("reads AI SDK messages", () => {
    expect(messageText(asOurs)).toBe("Found **3** pages.")
    const tool = asOurs.parts.find(isToolPart) as AiToolPart
    expect(toolName(tool)).toBe("searchDocs")
    expect(many).toHaveLength(1)
  })

  it("names dynamic tools by toolName", () => {
    expect(toolName({ type: "dynamic-tool", toolName: "sendEmail", toolCallId: "1", state: "input-available" })).toBe("sendEmail")
  })

  it("joins every text part for Copy", () => {
    expect(messageText({ id: "1", role: "assistant", parts: [{ type: "text", text: "a" }, { type: "reasoning", text: "x" }, { type: "text", text: "b" }] })).toBe("a\n\nb")
  })
})

describe("formatCost", () => {
  it("keeps fractions of a cent readable", () => {
    expect(formatCost(0.0031, "en-US")).toBe("$0.0031")
    expect(formatCost(1.5, "en-US")).toBe("$1.50")
    expect(formatCost(0, "en-US")).toBe("$0.00")
  })
})

describe("formatDuration", () => {
  const plain = (ms: number, locale = "en") => formatDuration(ms, locale).replace(/\s/g, " ")
  it("picks ms, s or min", () => {
    expect(plain(950)).toBe("950ms")
    expect(plain(9420)).toBe("9.4s")
    expect(plain(42_000)).toBe("42s")
    expect(plain(125_000)).toBe("2m 5s")
  })
  it("follows the locale", () => {
    expect(plain(9420, "fr")).toBe("9,4s")
  })
})

describe("promptVariables", () => {
  it("lists each {{variable}} once, in order", () => {
    expect(promptVariables("Hi {{name}}, about {{ project }} and {{name}}.")).toEqual(["name", "project"])
    expect(promptVariables("No variables.")).toEqual([])
  })
})
