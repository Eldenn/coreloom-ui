// API try it: required parameters checked before sending (with focus on the first missing one),
// sending from the keyboard, the response announced and shown, Cancel, a failed call, an invalid
// JSON body, and Copy as cURL. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { allowClipboard, openStory } from './stories'

const open = (page: Page, story: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `blocks-developer-api-try-it--${story}`, 'dark', locale)

const status = (page: Page) => page.getByRole('status').filter({ hasText: /\S/ }).last()

test.describe('API try it (Blocks/Developer/API try it)', () => {
  test('a missing path parameter blocks Send and takes the focus', async ({ page }) => {
    await open(page, 'default')
    const projectId = page.getByRole('textbox', { name: /^projectId/ })
    await projectId.fill('')
    await expect(page.getByLabel('Request URL')).toHaveText(
      'https://api.coreloom.dev/v1/projects/{projectId}/deployments?limit=20',
    )
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByText('Enter projectId: it’s required.')).toBeVisible()
    await expect(projectId).toBeFocused()
    await expect(projectId).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Send the request to see the response here.')).toBeVisible()
  })

  test('fills a path parameter, sends with Enter, and shows the response', async ({ page }) => {
    await open(page, 'default')
    const projectId = page.getByRole('textbox', { name: /^projectId/ })
    await projectId.fill('docs site')
    await expect(page.getByLabel('Request URL')).toHaveText(
      'https://api.coreloom.dev/v1/projects/docs%20site/deployments?limit=20',
    )
    await projectId.press('Enter')
    await expect(
      page.getByRole('status').filter({ hasText: 'Response received: 200 OK.' }),
    ).toHaveCount(1)
    const response = page.getByRole('region', { name: 'Response' })
    await expect(response.getByText('200 OK')).toBeVisible()
    await expect(response.getByText('Success')).toBeVisible()
    await expect(response.getByText('"dpl_7Hq2"')).toBeVisible()
    await response.getByRole('tab', { name: /Headers/ }).click()
    await expect(response.getByText('x-request-id')).toBeVisible()
  })

  test('Cancel stops the request and leaves focus on Send', async ({ page }) => {
    await open(page, 'default')
    await page.getByRole('button', { name: 'Send request' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(status(page)).toHaveText('Request cancelled.')
    await expect(page.getByRole('button', { name: 'Cancel' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Send request' })).toBeFocused()
    await expect(page.getByRole('region', { name: 'Response' })).toContainText('Request cancelled.')
  })

  test('without a token the fake API answers 401, shown as a client error', async ({ page }) => {
    await open(page, 'default')
    await page.getByLabel('Bearer token').fill('')
    await page.getByRole('button', { name: 'Send request' }).click()
    const response = page.getByRole('region', { name: 'Response' })
    await expect(response.getByText('401 Unauthorized')).toBeVisible()
    await expect(response.getByText('Client error')).toBeVisible()
  })

  test('a call that fails shows its message in an alert', async ({ page }) => {
    await open(page, 'network-error')
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('alert')).toContainText(
      'The request didn’t get an answer: Failed to fetch',
    )
  })

  test('an invalid JSON body blocks Send; Ctrl+Enter sends from the editor', async ({ page }) => {
    await open(page, 'post-with-body')
    const body = page.getByRole('textbox', { name: 'Request body' })
    await body.fill('{"name": ')
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByText('This isn’t valid JSON: check line 1, column 10.')).toBeVisible()
    await expect(body).toBeFocused()
    await body.fill('{"name": "Web app"}')
    await body.press('Control+Enter')
    await expect(page.getByRole('region', { name: 'Response' })).toContainText('200 OK')
  })

  test('Copy as cURL copies a command with the headers and the body', async ({ page }) => {
    await open(page, 'post-with-body')
    await allowClipboard(page)
    await page.getByRole('button', { name: 'Copy as cURL' }).click()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain("curl -X POST 'https://api.coreloom.dev/v1/projects'")
    expect(copied).toContain("-H 'Idempotency-Key: b8e2d0c4-1f6a-4c39-9a57-3e0d2f7b1c88'")
    expect(copied).toContain("-H 'Authorization: Bearer cl_live_4f7a9c2e81d3b6a0'")
    expect(copied).toContain("-H 'Content-Type: application/json'")
    expect(copied).toContain('--data-raw')
  })

  test('the French story speaks French', async ({ page }) => {
    await open(page, 'french', 'fr')
    await expect(page.getByRole('button', { name: 'Envoyer la requête' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Réponse' })).toContainText('Succès')
  })
})
