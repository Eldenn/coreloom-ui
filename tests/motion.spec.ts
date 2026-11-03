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
