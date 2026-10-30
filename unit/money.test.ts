import { describe, expect, it } from "vitest"

import { parseMoney } from "@/components/ui/money-input"

describe("parseMoney", () => {
  it("reads English amounts", () => {
    expect(parseMoney("1,234.50", "en-US")).toBe(1234.5)
    expect(parseMoney("1234.5", "en-US")).toBe(1234.5)
    expect(parseMoney("  12 ", "en-US")).toBe(12)
    expect(parseMoney(".5", "en-US")).toBe(0.5)
  })

  it("reads French amounts, with any kind of space between thousands", () => {
    expect(parseMoney("1 234,50", "fr-FR")).toBe(1234.5)
    expect(parseMoney("1 234,50", "fr-FR")).toBe(1234.5)
    expect(parseMoney("1 234,5", "fr-FR")).toBe(1234.5)
    expect(parseMoney("12,5", "fr-FR")).toBe(12.5)
  })

  it("accepts a point as the decimal in French, where it can't be a group separator", () => {
    expect(parseMoney("12.5", "fr-FR")).toBe(12.5)
  })

  it("treats the point as the thousands separator in German", () => {
    expect(parseMoney("1.234,56", "de-DE")).toBe(1234.56)
    expect(parseMoney("12.5", "de-DE")).toBe(125)
  })

  it("keeps negatives", () => {
    expect(parseMoney("-12", "en-US")).toBe(-12)
    expect(parseMoney("-1 234,5", "fr-FR")).toBe(-1234.5)
  })

  it("returns null for empty or unreadable text", () => {
    for (const text of ["", "   ", "-", ".", "abc", "12abc", "1.2.3", "--5", "12-"]) expect(parseMoney(text, "en-US"), text).toBeNull()
  })

  it("works with currencies without decimals", () => {
    expect(parseMoney("1,500", "en-US", "JPY")).toBe(1500)
  })
})
