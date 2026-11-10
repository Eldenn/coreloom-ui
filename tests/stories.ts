import fs from 'node:fs'
import path from 'node:path'

import type { Locator, Page } from '@playwright/test'

export const THEMES = ['dark', 'light'] as const
export type Theme = (typeof THEMES)[number]

interface Entry {
  id: string
  type: string
  title: string
  name: string
  tags?: string[]
}

/** Every story in the Storybook build (docs pages excluded). Stories tagged `no-test` are skipped. */
export function stories(): Entry[] {
  const file = path.resolve('public/storybook/index.json')
  if (!fs.existsSync(file)) throw new Error('No Storybook build: run pnpm storybook:build first.')
  const index = JSON.parse(fs.readFileSync(file, 'utf8')) as { entries: Record<string, Entry> }
  return Object.values(index.entries).filter(
    (e) => e.type === 'story' && !e.tags?.includes('no-test'),
  )
}

/** Opens one story in the bare iframe, with a fixed clock, no outside network, fonts loaded. */
export type Locale = 'en' | 'fr' | 'es' | 'de'
export type Accent = 'cyan' | 'blue' | 'violet' | 'amber' | 'rose'

export async function openStory(
  page: Page,
  id: string,
  theme: Theme,
  locale: Locale = 'en',
  accent: Accent = 'cyan',
) {
  // Calendars mark "today" and tables show dates: freeze time so screenshots don't change daily.
  await page.clock.setFixedTime(new Date('2026-10-14T10:00:00+02:00'))
  // Only the local Storybook loads; anything remote (avatars, embeds) falls back.
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (route) => route.abort())
  // a11y.manual stops Storybook's own a11y addon from running axe in the page (two runs collide).
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};locale:${locale};accent:${accent};a11y.manual:!true`,
  )
  await page.locator('#storybook-root').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  // Stories that submit a form or fetch on mount: wait for them to settle. Stories frozen mid-stream
  // (inside [data-frozen]) stay busy on purpose.
  await page.waitForFunction(
    () =>
      !document.querySelector(
        '#storybook-root [data-submitting], #storybook-root [aria-busy=true]:not([data-frozen] *)',
      ),
    null,
    { timeout: 5000 },
  )
  // Popovers, toasts and progress bars animate in: axe would measure the contrast of a half-faded
  // element, and only on a busy machine where the animation is still running. Wait for the finite
  // ones to end (spinners and carets loop forever: skip those; scroll-driven ones follow the
  // scroll, not the clock, and never end on their own: skip those too).
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) =>
          a.playState !== 'running' ||
          a.effect?.getTiming().iterations === Infinity ||
          a.timeline !== document.timeline,
      ),
  )
  // Recharts animates its shapes from JavaScript, frame by frame, which getAnimations() doesn't
  // see: a screenshot could catch a radar or an area half drawn. Wait until the charts' SVG stops
  // changing (no mutation for 300 ms), for 5 s at most.
  if (await page.locator('#storybook-root .recharts-wrapper').count()) await chartsSettled(page)
}

function chartsSettled(page: Page) {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          clearTimeout(quiet)
          quiet = setTimeout(done, 300)
        })
        let quiet = setTimeout(done, 300)
        const cap = setTimeout(done, 5000)
        function done() {
          observer.disconnect()
          clearTimeout(quiet)
          clearTimeout(cap)
          resolve()
        }
        for (const chart of document.querySelectorAll('#storybook-root .recharts-wrapper'))
          observer.observe(chart, { subtree: true, attributes: true, childList: true })
      }),
  )
}

/**
 * Lets a test read what the page copies, with `navigator.clipboard.readText()`. Call it once the
 * story is open. Chrome grants the real clipboard; Firefox and Safari don't let a script read it,
 * so there `writeText` is recorded instead.
 */
export async function allowClipboard(page: Page) {
  if (page.context().browser()?.browserType().name() === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    return
  }
  await page.evaluate(() => {
    let copied = ''
    // A real Ctrl+C in an editor never calls writeText: read what its copy handler put in the event.
    document.addEventListener('copy', (event) => {
      const text = event.clipboardData?.getData('text/plain')
      if (text) copied = text
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          copied = text
          return Promise.resolve()
        },
        readText: () => Promise.resolve(copied),
      },
    })
  })
}

/**
 * Sends a `copy`, `cut` or `paste` event to an element, carrying `text`, and returns the text its
 * handler left in the event. Firefox ignores the `clipboardData` given to the ClipboardEvent
 * constructor, so the data is attached to the event itself.
 */
export function clipboardEvent(target: Locator, type: 'copy' | 'cut' | 'paste', text = '') {
  return target.evaluate(
    (el, init) => {
      const data = new DataTransfer()
      if (init.text) data.setData('text/plain', init.text)
      const event = new ClipboardEvent(init.type, { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', { value: data })
      el.dispatchEvent(event)
      return data.getData('text/plain')
    },
    { type, text },
  )
}

/**
 * Adds a button before and after the story, for tests where Tab must leave a component. A real
 * page has other things to focus; alone on a page, Firefox keeps focus where it is.
 */
export async function addTabStops(page: Page) {
  await page.evaluate(() => {
    const button = (label: string) =>
      Object.assign(document.createElement('button'), { textContent: label })
    document.body.prepend(button('Before'))
    document.body.append(button('After'))
  })
}
