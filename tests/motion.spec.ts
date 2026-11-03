// Motion components: content that reveals itself ends visible, text effects read as plain text,
// the marquee can be paused, view transitions change the view, and reduced motion shows everything
// at once. Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('revealed content ends visible once it is in view', async ({ page }) => {
  await open(page, 'components-motion-reveal--effects')
  const items = page.locator('[data-slot=reveal]')
  await expect(items).toHaveCount(7)
  for (const item of await items.all()) {
    await expect(item).toHaveAttribute('data-state', 'visible')
    await expect(item).toHaveCSS('opacity', '1')
  }
})

test('a stagger reveals every item', async ({ page }) => {
  await open(page, 'components-motion-reveal--staggered-grid')
  await expect(page.locator('[data-slot=stagger]')).toHaveAttribute('data-state', 'visible')
  await expect(page.locator('[data-slot=stagger-item]')).toHaveCount(6)
  await expect(page.locator('[data-slot=stagger-item]').last()).toHaveCSS('opacity', '1')
})

test('with reduced motion the content is there without moving', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 'components-motion-reveal--effects')
  await expect(page.locator('[data-slot=reveal]').first()).toHaveCSS('opacity', '1')
  await open(page, 'components-motion-text-effects--typewriter-loop')
  await expect(page.locator('[data-slot=typewriter] [aria-hidden]').first()).toHaveText(
    'dashboards',
  )
})

test('word by word text reads as one sentence', async ({ page }) => {
  await open(page, 'components-motion-text-effects--default')
  const reveal = page.locator('[data-slot=word-reveal]')
  await expect(reveal.locator('.sr-only')).toHaveText('Ship interfaces your users trust')
  await expect(reveal.locator('[aria-hidden] > span')).toHaveCount(5)
  await expect(reveal.locator('[aria-hidden] > span').last()).toHaveCSS('opacity', '1')
})

test('the typewriter types its first phrase and screen readers get all of them', async ({
  page,
}) => {
  await open(page, 'components-motion-text-effects--typewriter-loop')
  const typewriter = page.locator('[data-slot=typewriter]')
  await expect(typewriter.locator('.sr-only')).toHaveText('dashboards, AI agents, docs sites')
  await expect(typewriter.locator('[aria-hidden]').first()).toHaveText('dashboards', {
    timeout: 5000,
  })
})

test('the marquee pauses and plays again from its button', async ({ page }) => {
  await open(page, 'components-motion-marquee--default')
  const marquee = page.locator('[data-slot=marquee]')
  await expect(marquee).toHaveAttribute('data-state', 'running')
  // The items are read once: the copy that closes the loop is hidden.
  await expect(page.getByText('Northwind', { exact: true })).toHaveCount(2)
  await expect(marquee.locator('[aria-hidden=true][inert]')).toHaveCount(1)
  const pause = page.getByRole('button', { name: 'Pause the animation' })
  await expect(pause).toHaveAttribute('aria-pressed', 'false')
  await pause.click()
  await expect(marquee).toHaveAttribute('data-state', 'paused')
  const play = page.getByRole('button', { name: 'Play the animation' })
  await expect(play).toHaveAttribute('aria-pressed', 'true')
  await expect(play).toBeFocused()
  await play.press('Enter')
  await expect(marquee).toHaveAttribute('data-state', 'running')
})

test('the marquee button is named in French', async ({ page }) => {
  await open(page, 'components-motion-marquee--french', 'fr')
  await expect(page.getByRole('button', { name: 'Mettre l’animation en pause' })).toBeVisible()
})

test('a view transition changes the step, forward and back', async ({ page }) => {
  await open(page, 'components-motion-view-transition--default')
  await expect(page.getByText('Create a project')).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('Connect a repository')).toBeVisible()
  await expect(page.locator('html')).not.toHaveAttribute('data-view-transition', /.*/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByText('Create a project')).toBeVisible()
})

test('a status button shows and announces each state', async ({ page }) => {
  await open(page, 'components-motion-micro-interactions--interactive')
  const button = page.getByRole('button', { name: 'Save changes' })
  await button.click()
  await expect(page.getByRole('button', { name: 'Saving…' })).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByRole('status').filter({ hasText: 'Saving…' })).toBeAttached()
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible({ timeout: 3000 })
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeAttached()
  await expect(page.getByRole('button', { name: 'Saved' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible({ timeout: 3000 })
})

test('an animated list adds and removes items', async ({ page }) => {
  await open(page, 'components-motion-micro-interactions--list')
  const items = page.locator('[data-slot=animated-list-item]')
  await expect(items).toHaveCount(3)
  await page.getByRole('button', { name: 'Add a task' }).click()
  await expect(page.getByText('New task 4')).toBeVisible()
  await expect(items).toHaveCount(4)
  await page.getByRole('button', { name: 'Remove Ship the motion tokens' }).click()
  // Leaving: hidden from screen readers at once, gone after its exit.
  await expect(page.getByRole('button', { name: 'Remove Ship the motion tokens' })).toHaveCount(0)
  await expect(items).toHaveCount(3)
})

test('the tabs indicator follows the active tab', async ({ page }) => {
  await open(page, 'components-motion-micro-interactions--sliding-tabs')
  const indicator = page.locator('[data-slot=tabs-indicator][data-variant=pill]')
  const tab = page.getByRole('tab', { name: 'Settings' })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  await expect
    .poll(async () => {
      const [a, b] = await Promise.all([indicator.boundingBox(), tab.boundingBox()])
      return a && b ? Math.abs(a.x - b.x) < 1 : null
    })
    .toBe(true)
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab', { name: 'Deployments' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('the animated height follows its content', async ({ page }) => {
  await open(page, 'components-motion-micro-interactions--height')
  const box = page.locator('[data-slot=animated-height]')
  const before = (await box.boundingBox())?.height ?? 0
  await page.getByRole('button', { name: 'Show more' }).click()
  await expect.poll(async () => (await box.boundingBox())?.height ?? 0).toBeGreaterThan(before + 20)
})

test('a ping is named for screen readers', async ({ page }) => {
  await open(page, 'components-motion-signals--placements')
  await expect(page.getByText('3 unread')).toBeAttached()
  await expect(page.getByText('Online')).toBeAttached()
})

test('confetti bursts and cleans up, and stays off with reduced motion', async ({ page }) => {
  await open(page, 'components-motion-signals--confetti')
  await page.getByRole('button', { name: 'Finish onboarding' }).click()
  await expect(page.locator('[data-slot=confetti]')).toHaveCount(1)
  await expect(page.locator('[data-slot=confetti]')).toHaveCount(0, { timeout: 5000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Finish onboarding' }).click()
  await expect(page.locator('[data-slot=confetti]')).toHaveCount(0)
})

test('the page progress bar is busy while loading, then goes away', async ({ page }) => {
  await open(page, 'components-motion-signals--page-load')
  await page.getByRole('button', { name: 'Start loading' }).click()
  const bar = page.getByRole('progressbar', { name: 'Loading the page' })
  await expect(bar).toHaveAttribute('aria-busy', 'true')
  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(bar).toHaveCount(0, { timeout: 3000 })
})

test('the typing indicator says who is typing, in French too', async ({ page }) => {
  await open(page, 'components-motion-signals--typing')
  await expect(page.getByRole('status').filter({ hasText: 'Lena is typing' })).toBeAttached()
  await open(page, 'components-motion-signals--french', 'fr')
  await expect(
    page.getByRole('status').filter({ hasText: 'Lena est en train d’écrire' }),
  ).toBeAttached()
})

test('scrambled text settles on the text and reads as it', async ({ page }) => {
  await open(page, 'components-motion-showcase-effects--scramble')
  const scramble = page.locator('[data-slot=scramble-text]')
  await expect(scramble.locator('.sr-only')).toHaveText('ACCESS GRANTED')
  await expect(scramble.locator('[aria-hidden]')).toHaveText('ACCESS GRANTED', { timeout: 4000 })
})

test('images revealed by a mask end uncovered', async ({ page }) => {
  await open(page, 'components-motion-showcase-effects--image-reveal')
  const items = page.locator('[data-slot=reveal]')
  await expect(items).toHaveCount(3)
  for (const item of await items.all()) await expect(item).toHaveAttribute('data-state', 'visible')
})
