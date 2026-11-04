// Agent avatar: what a screen reader hears, how the face follows the state, and where it is built
// in (chat, plan, agent graph). Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('an avatar is an image named after the agent and its state', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--states')
  await expect(page.getByRole('img', { name: 'Researcher, thinking' })).toHaveCount(2)
  await expect(page.getByRole('img', { name: 'Researcher, answering' })).toHaveCount(2)
  await expect(page.getByRole('img', { name: 'Researcher, error' })).toHaveCount(2)
})

test('the state is said in French', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--french', 'fr')
  await expect(page.getByRole('img', { name: 'Rédacteur, réfléchit' })).toBeVisible()
})

test('decorative avatars are hidden from screen readers', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--team')
  await expect(page.locator('[data-slot=agent-avatar]')).toHaveCount(6)
  await expect(page.getByRole('img')).toHaveCount(0)
})

test('the face changes with the state', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--live')
  const face = page.locator('[data-slot=agent-avatar][data-variant=face]')
  await expect(face).toHaveAttribute('data-state', 'idle')
  await page.getByRole('button', { name: 'Next state' }).click()
  await expect(face).toHaveAttribute('data-state', 'thinking')
  await expect(page.getByRole('img', { name: 'Researcher, thinking' })).toHaveCount(2)
})

test('the chat assistant talks while its answer streams', async ({ page }) => {
  await open(page, 'blocks-ai-chat--with-agent-avatar')
  const avatar = page
    .getByRole('article', { name: 'Assistant' })
    .locator('[data-slot=agent-avatar]')
  await expect(avatar).toHaveAttribute('data-state', 'speaking')
})

test('the agent graph shows each agent’s face for its activity', async ({ page }) => {
  await open(page, 'components-ai-agent-graph--with-avatars')
  const face = (id: string) => page.locator(`[data-agent=${id}] [data-slot=agent-avatar]`)
  await expect(face('tech')).toHaveAttribute('data-state', 'thinking')
  await expect(face('billing')).toHaveAttribute('data-state', 'done')
  // People and tools keep their icons.
  await expect(page.locator('[data-agent=oncall] [data-slot=agent-avatar]')).toHaveCount(0)
})

test('the plan’s avatar smiles when every step is done', async ({ page }) => {
  await open(page, 'components-ai-agent-plan--complete-with-avatar')
  await expect(page.locator('[data-slot=agent-plan] [data-slot=agent-avatar]')).toHaveAttribute(
    'data-state',
    'done',
  )
})

test('a listening agent says so', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--states')
  await expect(page.getByRole('img', { name: 'Researcher, listening' })).toHaveCount(2)
})

test('animated={false} shows every state without moving', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--still')
  await expect(page.locator('[data-slot=agent-avatar]')).toHaveCount(7)
  const moving = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (a) =>
            a.effect instanceof KeyframeEffect &&
            a.effect.target?.closest('[data-slot=agent-avatar]'),
        ).length,
  )
  expect(moving).toBe(0)
})

test('agents with different seeds start their idle loops at different points', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--team')
  const phases = await page
    .locator('[data-slot=agent-avatar]')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).getPropertyValue('--agent-phase')))
  expect(new Set(phases).size).toBeGreaterThan(3)
})

test('each shape draws its own outline, and the halo follows it', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--shapes')
  const avatars = page.locator('[data-slot=agent-avatar][data-variant=face]')
  await expect(avatars).toHaveCount(6)
  const shapes = await avatars.evaluateAll((els) => els.map((el) => el.dataset.shape))
  expect(shapes).toEqual(['square', 'circle', 'hexagon', 'diamond', 'shield', 'blob'])
  // Square and circle stay a CSS box; the others draw a path, filled with the tone.
  await expect(
    page.locator('[data-shape=square][data-variant=face] path[vector-effect]'),
  ).toHaveCount(0)
  await expect(
    page.locator('[data-shape=hexagon][data-variant=face] path[vector-effect]'),
  ).toHaveCount(1)
  // The dots think, with a halo: on a drawn shape the halo is the same path, not a box.
  await expect(page.locator('[data-shape=shield][data-variant=dots] path[fill=none]')).toHaveCount(
    1,
  )
  await expect(page.locator('[data-shape=circle][data-variant=dots] path[fill=none]')).toHaveCount(
    0,
  )
})

test('shape="seed" gives a team several outlines', async ({ page }) => {
  await open(page, 'components-ai-agent-avatar--seeded-shapes')
  const shapes = await page
    .locator('[data-slot=agent-avatar]')
    .evaluateAll((els) => els.map((el) => el.dataset.shape))
  expect(new Set(shapes).size).toBeGreaterThan(2)
})
