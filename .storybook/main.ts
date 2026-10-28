import path from "node:path"
import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite")
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    config.resolve = {
      ...config.resolve,
      alias: { ...(config.resolve?.alias ?? {}), "@": path.resolve(import.meta.dirname, "../src") },
    }
    // Served from https://eldenn.github.io/coreloom-ui/storybook/ — relative asset URLs.
    config.base = "./"
    // public/ holds the Pages output (registry, this build) — never copy it into the build.
    config.publicDir = false
    return config
  },
}

export default config
