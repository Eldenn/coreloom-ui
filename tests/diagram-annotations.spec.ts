// UmlDiagram annotations and FindingCard: badges name their element and finding, hand the id
// back, sit on sequence participants and messages, and stay out of thumbnails' focus order; a
// finding is marked done, ignored and reopened with focus kept and the change announced; evidence
// links are allowlisted. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const diagram = (page: Page, story: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `components-diagrams-uml-diagram--${story}`, 'dark', locale)
const card = (page: Page, story: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `components-diagrams-finding-card--${story}`, 'dark', locale)

test.describe('UML diagram annotations (Components/Diagrams/UML diagram)', () => {
  test('a badge names its element and finding, and hands the id back', async ({ page }) => {
    await diagram(page, 'annotated')
    const badge = page.getByRole('button', {
      name: 'Findings for Order: Differs from the code, 2 findings',
    })
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('2')
    await badge.click()
    await expect(page.getByRole('status')).toHaveText('Showing the findings for Order')

    // The keyboard reaches it too.
    const missing = page.getByRole('button', {
      name: 'Findings for OrderRepository: Missing from the code',
    })
    await missing.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toHaveText('Showing the findings for OrderRepository')
  })

  test('the element says its finding, so the status is not in colour alone', async ({ page }) => {
    await diagram(page, 'annotated')
    await expect(
      page.getByRole('group', { name: /^Class: Payment.*\. Finding: No issue$/ }),
    ).toHaveCount(1)
    await expect(page.locator('[data-slot="uml-annotation"]')).toHaveCount(4)
  })

  test('sequence diagrams carry badges on participants and messages', async ({ page }) => {
    await diagram(page, 'annotated-sequence')
    await expect(
      page.getByRole('button', {
        name: 'Findings for API: Calls a service that isn’t drawn',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: 'Findings for POST /orders/42/pay: No such route, 3 findings',
      }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /^Findings for Pay: No issue$/ })).toBeVisible()
  })

  test('a thumbnail keeps the marks but nothing to press', async ({ page }) => {
    await diagram(page, 'annotated-preview')
    await expect(page.locator('[data-slot="uml-annotation"]')).toHaveCount(4)
    await expect(page.getByRole('button')).toHaveCount(0)
  })

  test('badges speak French', async ({ page }) => {
    await diagram(page, 'french-annotated', 'fr')
    await expect(
      page.getByRole('button', { name: 'Constats pour Order : Diffère du code, 2 constats' }),
    ).toBeVisible()
  })
})

test.describe('Finding card (Components/Diagrams/Finding card)', () => {
  test('shows the status, severity, comment and evidence links', async ({ page }) => {
    await card(page, 'default')
    const article = page.getByRole('article', { name: 'Order' })
    await expect(article).toContainText('Differs from the code')
    await expect(article).toContainText('Severity: Medium')
    await expect(article).toContainText('OrderService.cancel')
    const link = article.getByRole('link', { name: /app\/orders\/order\.ts:12/ })
    await expect(link).toHaveAttribute('href', /order\.ts#L12$/)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noreferrer noopener')
  })

  test('mark as done, then reopen: focus follows and the change is announced', async ({ page }) => {
    await card(page, 'default')
    await page.getByRole('button', { name: 'Mark as done' }).click()
    await expect(page.getByRole('status')).toHaveText('Marked as done')
    const reopen = page.getByRole('button', { name: 'Reopen' })
    await expect(reopen).toBeFocused()
    await reopen.click()
    await expect(page.getByRole('status')).toHaveText('')
    await expect(page.getByRole('button', { name: 'Mark as done' })).toBeFocused()
    await page.getByRole('button', { name: 'Ignore' }).click()
    await expect(page.getByRole('status')).toHaveText('Ignored')
  })

  test('a badge selects its finding; Show in diagram selects the element', async ({ page }) => {
    await card(page, 'with-diagram')
    await page
      .getByRole('button', { name: 'Findings for OrderRepository: Missing from the code' })
      .click()
    await expect(page.getByRole('article', { name: 'OrderRepository' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    const payment = page.getByRole('article', { name: 'Payment' })
    await payment.getByRole('button', { name: 'Show in diagram' }).click()
    await expect(payment).toHaveAttribute('aria-current', 'true')
    await expect(page.locator('.react-flow__node.selected')).toHaveAttribute(
      'aria-label',
      /^Class: Payment/,
    )
  })

  test('a finding marked done leaves the drawing', async ({ page }) => {
    await card(page, 'with-diagram')
    await expect(page.locator('[data-slot="uml-annotation"]')).toHaveCount(3)
    await page
      .getByRole('article', { name: 'Order', exact: true })
      .getByRole('button', { name: 'Mark as done' })
      .click()
    await expect(page.locator('[data-slot="uml-annotation"]')).toHaveCount(2)
  })

  test('evidence without a link shows as text', async ({ page }) => {
    await card(page, 'long-content')
    await expect(page.getByRole('link')).toHaveCount(0)
    await expect(page.getByRole('article')).toContainText(
      'app/jobs/confirm_stock_reservation_job.ts:33',
    )
  })
})
