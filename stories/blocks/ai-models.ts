// Demo models for the model picker and the context meter stories. Names, windows and prices are sample
// data (not a price list): the stories only need them to stay the same.
import type { AiModel, AiUsage } from "@/lib/ai"

export const catalog: AiModel[] = [
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Balanced: strong at code and agents.",
    contextWindow: 200_000,
    pricing: { input: 3, output: 15 },
    capabilities: ["vision", "tools", "reasoning"],
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku",
    provider: "Anthropic",
    description: "Quick answers at a low price.",
    contextWindow: 200_000,
    pricing: { input: 1, output: 5 },
    capabilities: ["vision", "tools", "fast"],
  },
  {
    id: "claude-opus",
    name: "Claude Opus",
    provider: "Anthropic",
    description: "The most capable, for hard problems.",
    contextWindow: 1_000_000,
    pricing: { input: 5, output: 25 },
    capabilities: ["vision", "tools", "reasoning"],
  },
  {
    id: "gpt-mini",
    name: "GPT mini",
    provider: "OpenAI",
    description: "Small and cheap, for classification.",
    contextWindow: 128_000,
    pricing: { input: 0.15, output: 0.6 },
    capabilities: ["tools", "fast"],
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    description: "Open weights, hosted in the EU.",
    contextWindow: 128_000,
    pricing: { input: 2, output: 6 },
    capabilities: ["tools"],
  },
  {
    id: "local-llama",
    name: "Llama (self-hosted)",
    provider: "Local",
    description: "Runs on your own GPU; nothing leaves the network.",
    contextWindow: 32_000,
    capabilities: ["tools"],
    disabled: true,
  },
]

/** A conversation two fifths into a 200K window, with cached input and reasoning. */
export const usage: AiUsage = {
  inputTokens: 80_412,
  inputTokenDetails: { cacheReadTokens: 61_200 },
  outputTokens: 4_180,
  outputTokenDetails: { reasoningTokens: 2_350 },
  totalTokens: 84_592,
}
