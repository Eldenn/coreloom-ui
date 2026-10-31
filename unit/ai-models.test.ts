import type { LanguageModelUsage } from "ai"
import { describe, expect, it } from "vitest"

import { contextLevel, estimateCost, formatTokenPrice, formatTokens, usageDetails, usageTotal, type AiModel, type AiUsage } from "@/lib/ai"

// Type-level: the AI SDK's usage goes into the meter as it is, and a model with only an id and a name still fits.
const sdkUsage: LanguageModelUsage = {
  inputTokens: 80_000,
  inputTokenDetails: { noCacheTokens: 50_000, cacheReadTokens: 30_000, cacheWriteTokens: undefined },
  outputTokens: 4_000,
  outputTokenDetails: { textTokens: 1_500, reasoningTokens: 2_500 },
  totalTokens: 84_000,
}
const asOurs: AiUsage = sdkUsage
const bare: AiModel = { id: "m", name: "M" }
const plain = (s: string) => s.replace(/\s/g, " ")

describe("formatTokens", () => {
  it("shortens to K and M", () => {
    expect(formatTokens(950, "en")).toBe("950")
    expect(formatTokens(1500, "en")).toBe("1.5K")
    expect(formatTokens(128_000, "en")).toBe("128K")
    expect(formatTokens(200_000, "en")).toBe("200K")
    expect(formatTokens(12_345, "en")).toBe("12K")
    expect(formatTokens(1_000_000, "en")).toBe("1M")
    expect(formatTokens(1_048_576, "en")).toBe("1M")
  })
  it("follows the locale", () => {
    expect(plain(formatTokens(200_000, "fr"))).toBe("200 k")
    expect(plain(formatTokens(1500, "es"))).toBe("1,5 mil")
    // German writes thousands out in full (CLDR has no short form for them).
    expect(formatTokens(200_000, "de")).toBe("200.000")
    expect(plain(formatTokens(1_500_000, "de"))).toBe("1,5 Mio.")
  })
})

describe("formatTokenPrice", () => {
  it("drops decimals on whole amounts and keeps fractions of a dollar", () => {
    expect(formatTokenPrice(3, "en-US")).toBe("$3")
    expect(formatTokenPrice(15, "en-US")).toBe("$15")
    expect(formatTokenPrice(0.25, "en-US")).toBe("$0.25")
    expect(formatTokenPrice(2.5, "en-US")).toBe("$2.50")
    expect(formatTokenPrice(0.075, "en-US")).toBe("$0.075")
  })
  it("follows the locale and the currency", () => {
    expect(plain(formatTokenPrice(3, "fr-FR"))).toBe("3 $US")
    expect(plain(formatTokenPrice(2.5, "fr-FR", "EUR"))).toBe("2,50 €")
  })
})

describe("usage", () => {
  it("totals a count, totalTokens, or input + output", () => {
    expect(usageTotal(42_000)).toBe(42_000)
    expect(usageTotal({ inputTokens: 1000, outputTokens: 200 })).toBe(1200)
    expect(usageTotal({ inputTokens: 1000, outputTokens: 200, totalTokens: 1300 })).toBe(1300)
    expect(usageTotal({})).toBe(0)
    expect(bare.contextWindow).toBeUndefined()
  })
  it("reads reasoning and cached tokens from the SDK's details, or v5's flat fields", () => {
    expect(usageTotal(asOurs)).toBe(84_000)
    expect(usageDetails(asOurs)).toEqual({ reasoning: 2_500, cached: 30_000 })
    expect(usageDetails({ reasoningTokens: 10, cachedInputTokens: 20 })).toEqual({ reasoning: 10, cached: 20 })
    expect(usageDetails({})).toEqual({ reasoning: undefined, cached: undefined })
  })
  it("estimates the cost at the price per million tokens", () => {
    expect(estimateCost({ inputTokens: 1_000_000, outputTokens: 100_000 }, { input: 3, output: 15 })).toBeCloseTo(4.5)
    expect(estimateCost({ inputTokens: 80_000, outputTokens: 4_000 }, { input: 3, output: 15 })).toBeCloseTo(0.3)
    expect(estimateCost({}, { input: 3, output: 15 })).toBe(0)
  })
})

describe("contextLevel", () => {
  it("warns from 80 % and turns critical from 95 %", () => {
    expect(contextLevel(0, 200_000)).toBe("ok")
    expect(contextLevel(159_999, 200_000)).toBe("ok")
    expect(contextLevel(160_000, 200_000)).toBe("warning")
    expect(contextLevel(189_999, 200_000)).toBe("warning")
    expect(contextLevel(190_000, 200_000)).toBe("critical")
    expect(contextLevel(250_000, 200_000)).toBe("critical")
    expect(contextLevel(10, 0)).toBe("ok")
  })
})
