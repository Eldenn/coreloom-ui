import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { safeSourceUrl, splitCitations, type CitationSource } from "@/components/ui/inline-citation"
import { Markdown } from "@/components/ui/markdown"

describe("splitCitations", () => {
  it("cuts the model's markers out of the text, in order", () => {
    expect(splitCitations("Fixed in v0.8 [1][2].", 2)).toEqual(["Fixed in v0.8 ", 1, 2, "."])
    expect(splitCitations("[2] first, then [1]", 2)).toEqual([2, " first, then ", 1])
    expect(splitCitations("end.[1]", 1)).toEqual(["end.", 1])
  })

  it("leaves numbers without a source as text", () => {
    expect(splitCitations("See [0] and [3].", 2)).toEqual(["See [0] and [3]."])
    expect(splitCitations("See [1] and [3].", 2)).toEqual(["See ", 1, " and [3]."])
    expect(splitCitations("Nothing here", 0)).toEqual(["Nothing here"])
  })

  it("keeps a half-written marker as text while streaming", () => {
    expect(splitCitations("pruned after a week [1", 2)).toEqual(["pruned after a week [1"])
    expect(splitCitations("pruned [1] after [", 2)).toEqual(["pruned ", 1, " after ["])
  })

  it("ignores what only looks like a marker: indexes, escapes, other shapes", () => {
    expect(splitCitations("[a] [1a] [ 1 ] [1,2]", 3)).toEqual(["[a] [1a] [ 1 ] [1,2]"])
    expect(splitCitations("x[1] arr[2] 3[1]", 3)).toEqual(["x[1] arr[2] 3[1]"])
    expect(splitCitations("[1] here", 1, "x")).toEqual(["[1] here"])
    expect(splitCitations("[1] here", 1, " ")).toEqual([1, " here"])
  })
})

describe("safeSourceUrl", () => {
  it("lets web and mail addresses through, nothing else", () => {
    expect(safeSourceUrl("https://coreloom.dev/docs")).toBe("https://coreloom.dev/docs")
    expect(safeSourceUrl(" http://coreloom.dev ")).toBe("http://coreloom.dev")
    expect(safeSourceUrl("mailto:ops@coreloom.dev")).toBe("mailto:ops@coreloom.dev")
    expect(safeSourceUrl("javascript:alert(1)")).toBeUndefined()
    expect(safeSourceUrl("JaVaScRiPt:alert(1)")).toBeUndefined()
    expect(safeSourceUrl("data:text/html,<b>x</b>")).toBeUndefined()
    expect(safeSourceUrl("/relative")).toBeUndefined()
    expect(safeSourceUrl(undefined)).toBeUndefined()
  })
})

const sources: CitationSource[] = [
  { type: "source-url", sourceId: "s1", url: "https://coreloom.dev/docs/deployments", title: "Deployments guide" },
  { type: "source-url", sourceId: "s2", url: "https://coreloom.dev/docs/retention", title: "Retention of builds" },
]
const render = (text: string, withSources = sources) => renderToStaticMarkup(React.createElement(Markdown, { sources: withSources, children: text }))
const citations = (html: string) => [...html.matchAll(/aria-label="(Source \d[^"]*)"/g)].map((m) => m[1])

describe("Markdown citations", () => {
  it("turns markers into citations named after their source", () => {
    expect(citations(render("Roll back [1][2]. Kept a week [2]."))).toEqual(["Source 1: Deployments guide", "Source 2: Retention of builds", "Source 2: Retention of builds"])
  })

  it("leaves escaped markers, indexes and code alone", () => {
    const html = render("Escaped \\[1\\] and \\[2], index x[1] and `arr[2]`, then a real one [1].")
    expect(citations(html)).toEqual(["Source 1: Deployments guide"])
    expect(html).toContain("Escaped [1] and [2], index x[1]")
    expect(html).toContain("arr[2]</code>")
  })

  it("never lets a model-written definition turn [1] into a link", () => {
    const html = render("See [1] and [3].\n\n[1]: https://evil.example\n[3]: https://evil.example")
    expect(html).not.toContain("evil.example")
    expect(citations(html)).toEqual(["Source 1: Deployments guide"])
    expect(html).toContain("[3]")
    // Without sources, still no link: plain text.
    const plain = render("See [1].\n\n[1]: https://evil.example", [])
    expect(plain).not.toContain("evil.example")
    expect(plain).toContain("See [1].")
  })

  it("keeps ordinary links, full references included", () => {
    const html = render("Read [the guide](https://coreloom.dev/docs) or [the runbook][rb] [1].\n\n[rb]: https://coreloom.dev/runbook")
    expect(html).toContain('href="https://coreloom.dev/docs"')
    expect(html).toContain('href="https://coreloom.dev/runbook"')
    expect(citations(html)).toEqual(["Source 1: Deployments guide"])
  })
})

describe("Markdown footnotes", () => {
  const html = render("A claim[^a].\n\n[^a]: The proof.", [])

  it("labels them with a paragraph, not a heading, and keeps jumps in the page", () => {
    expect(html).not.toMatch(/<h[1-6]/)
    expect(html).toMatch(/<p[^>]*id="[^"]+footnote-label"[^>]*>Footnotes<\/p>/)
    expect(html).toContain('aria-label="Back to reference 1"')
    expect(html).not.toMatch(/href="#[^"]*"[^>]*target="_blank"/)
    expect(html).not.toMatch(/target="_blank"[^>]*href="#/)
  })

  it("gives each block its own footnote ids", () => {
    const id = /id="([^"]+footnote-label)"/.exec(html)?.[1]
    expect(id).not.toBe("footnote-label")
    expect(html).toContain(`aria-describedby="${id}"`)
  })
})
