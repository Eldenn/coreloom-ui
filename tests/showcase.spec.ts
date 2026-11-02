// Showcase block: opening hours, contact links, practitioner cards, footer and legal layout.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('opening hours: open now, closing time, today marked', async ({ page }) => {
  await open(page, 'blocks-showcase--contact-and-hours')
  await expect(page.getByText('Open now')).toBeVisible()
  await expect(page.getByText('Closes at 12:30 PM')).toBeVisible()
  const table = page.getByRole('table', { name: 'Opening hours' })
  await expect(table.getByRole('row')).toHaveCount(7)
  const today = table.locator('tr[aria-current="date"]')
  await expect(today).toHaveCount(1)
  await expect(today.getByRole('rowheader')).toHaveText('Wednesday')
  await expect(table.getByRole('row', { name: /Sunday/ })).toContainText('Closed')
  await expect(page.getByText('Exceptional hours')).toBeVisible()
})

test('opening hours: Saturday evening, it opens on Monday, in French', async ({ page }) => {
  await open(page, 'blocks-showcase--hours-closed', 'fr')
  await expect(page.getByText('Fermé', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Ouvre lundi à 9:00')).toBeVisible()
})

test('contact details: phone dials digits, directions open in a new tab', async ({ page }) => {
  await open(page, 'blocks-showcase--contact-and-hours')
  await expect(page.getByRole('link', { name: '04 78 00 00 00' })).toHaveAttribute(
    'href',
    'tel:0478000000',
  )
  await expect(page.getByRole('link', { name: 'contact@atelier-osteo.example' })).toHaveAttribute(
    'href',
    'mailto:contact@atelier-osteo.example',
  )
  const directions = page.getByRole('link', { name: /Get directions/ })
  await expect(directions).toHaveAttribute('target', '_blank')
  await expect(directions).toHaveAttribute('rel', 'noreferrer noopener')
})

test('practitioner cards: named headings, specialties as a list', async ({ page }) => {
  await open(page, 'blocks-showcase--practitioners')
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3)
  const card = page.getByRole('article').filter({ hasText: 'Claire Morel' })
  await expect(card.getByRole('list', { name: 'Specialties' }).getByRole('listitem')).toHaveCount(3)
  await expect(card.getByRole('link', { name: /Book with Claire/ })).toBeVisible()
})

test('footer: a labelled nav per link column and the legal row', async ({ page }) => {
  await open(page, 'blocks-showcase--footer')
  await expect(
    page.getByRole('navigation', { name: 'The practice' }).getByRole('link'),
  ).toHaveCount(4)
  await expect(page.getByRole('navigation', { name: 'Care' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Footer' }).getByRole('link')).toHaveCount(2)
  await expect(page.getByRole('list', { name: 'Social media' }).getByRole('link')).toHaveCount(1)
})

test('legal layout: contents link to numbered sections', async ({ page }) => {
  await open(page, 'blocks-showcase--legal-page')
  await expect(page.getByRole('heading', { level: 1, name: 'Legal notice' })).toBeVisible()
  await expect(page.getByText('Last updated September 30, 2026')).toBeVisible()
  const toc = page.getByRole('navigation', { name: 'On this page' })
  await toc.getByRole('link', { name: /Personal data/ }).click()
  await expect(page).toHaveURL(/#data$/)
  await expect(page.getByRole('region', { name: /Personal data/ })).toBeVisible()
})
