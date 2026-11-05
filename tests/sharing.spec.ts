// ShareDialog and AccessCodeGate: choices applied through the app's promise (and put back when it
// fails), confirmations before a new link or code, the copied message; the gate's input rules,
// auto-submit, paste, retry focus and lock. Runs on the built Storybook.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('Share dialog (Blocks/Sharing/Share dialog)', () => {
  test('a choice spins until the app applies it, then shows the link', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--private')
    const dialog = page.getByRole('dialog', { name: 'Share “Checkout”' })
    const choices = dialog.getByRole('radiogroup', { name: 'Who can open it' })
    await expect(choices.getByRole('radio', { name: /^Private/ })).toBeChecked()
    await expect(dialog.getByRole('textbox', { name: 'Link' })).toHaveCount(0)
    await choices.getByText('Public', { exact: true }).click()
    await expect(choices.getByRole('radio', { name: /^Public/ })).toBeChecked()
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(1)
    const link = dialog.getByRole('textbox', { name: 'Link' })
    await expect(link).toHaveValue('https://uml.coreloom.dev/s/k7Qp2Rw9')
    await expect(link).toHaveAttribute('readonly', '')
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Copy the link' })).toBeVisible()
    await expect(dialog.getByText('Access code')).toHaveCount(0)
  })

  test('a change that fails puts the old choice back and says so', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--change-fails')
    const choices = page.getByRole('radiogroup', { name: 'Who can open it' })
    await choices.getByText('Protected', { exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText('Couldn’t change who can open it. Try again.')
    await expect(choices.getByRole('radio', { name: /^Public/ })).toBeChecked()
    // Focus stays in the dialog.
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null))
      .toBe(true)
  })

  test('a new link is asked first, then replaces the old one', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--protected')
    await page.getByRole('button', { name: 'Regenerate the link' }).click()
    const confirm = page.getByRole('alertdialog', { name: 'Regenerate the link?' })
    await expect(confirm).toContainText('The old link will stop working.')
    await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused()
    await confirm.getByRole('button', { name: 'Regenerate' }).click()
    await expect(page.getByRole('textbox', { name: 'Link' })).toHaveValue(
      'https://uml.coreloom.dev/s/Vn4xT8bM',
    )
    await expect(confirm).toHaveCount(0)
  })

  test('a new code is asked first and says who loses access', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--protected')
    await page.getByRole('button', { name: 'Generate a new code' }).click()
    const confirm = page.getByRole('alertdialog', { name: 'Generate a new code?' })
    await expect(confirm).toContainText('People who already entered the old code will lose access.')
    await confirm.getByRole('button', { name: 'Cancel' }).click()
    await expect(confirm).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Generate a new code' })).toBeFocused()
  })

  test('the code is hidden until asked, and Copy link and code copies a message', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, 'blocks-sharing-share-dialog--protected')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('H7KM-3QPX')).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Show Access code' }).click()
    await expect(dialog.getByText('H7KM-3QPX')).toBeVisible()
    await dialog.getByRole('button', { name: 'Copy link and code' }).click()
    await expect(page.getByText('Link and code copied')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'Here is “Checkout”: https://uml.coreloom.dev/s/k7Qp2Rw9\nAccess code: H7KM-3QPX',
    )
  })

  test('closing gives focus back to the Share button', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--public')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByRole('button', { name: 'Share' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Share' })).toBeFocused()
  })

  test('French: the three choices', async ({ page }) => {
    await open(page, 'blocks-sharing-share-dialog--french', 'fr')
    await expect(page.getByRole('dialog', { name: 'Partager « Paiement »' })).toBeVisible()
    const choices = page.getByRole('radiogroup', { name: 'Qui peut l’ouvrir' })
    await expect(choices.getByRole('radio', { name: /^Privé/ })).toBeVisible()
    await expect(choices.getByText('Toute personne qui a le lien')).toBeVisible()
    await expect(choices.getByText('Le lien et un code')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copier le lien et le code' })).toBeVisible()
  })
})

test.describe('Access code gate (Blocks/Sharing/Access code gate)', () => {
  const field = (page: Page, name = 'Access code') => page.getByRole('textbox', { name })

  test('upper-cases, ignores what codes never hold, and sends when full', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--default')
    await expect(field(page)).toBeFocused()
    await page.keyboard.type('h7-k0m 3qpx')
    await expect(page.getByRole('status').filter({ hasText: 'Opening “Checkout”…' })).toBeVisible()
  })

  test('a wrong code empties the boxes and focuses the first one', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--default')
    await expect(page.getByText('3 attempts left')).toBeVisible()
    await page.keyboard.type('AAAAAAAA')
    await expect(page.getByRole('alert')).toContainText('That code didn’t work.')
    await expect(page.getByText('2 attempts left')).toBeVisible()
    await expect(field(page)).toHaveValue('')
    await expect(field(page)).toBeFocused()
    await expect(field(page)).toHaveAttribute('aria-describedby', /.+/)
  })

  test('a pasted code fills every box', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--default')
    await field(page).evaluate((input) => {
      const data = new DataTransfer()
      data.setData('text/plain', 'h7km-3qpx')
      input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
    })
    await expect(page.getByRole('status').filter({ hasText: 'Opening “Checkout”…' })).toBeVisible()
  })

  test('Open with a short code focuses the boxes', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--default')
    await page.keyboard.type('H7K')
    await page.getByRole('button', { name: 'Open' }).click()
    await expect(field(page)).toBeFocused()
    await expect(field(page)).toHaveValue('H7K')
  })

  test('locked: the boxes are off and a countdown says until when', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--locked')
    await expect(field(page)).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Open' })).toBeDisabled()
    const notice = page.getByRole('alert')
    await expect(notice).toContainText('Too many attempts')
    await expect(notice).toContainText('You can try again in')
    await expect(page.getByRole('timer')).toContainText('4 min')
    await expect(page.getByText(/attempts? left/)).toHaveCount(0)
  })

  test('six digits: other characters are ignored', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--six-digits')
    await field(page).focus()
    await page.keyboard.type('12a34')
    await expect(field(page)).toHaveValue('1234')
  })

  test('French: the lock in words', async ({ page }) => {
    await open(page, 'blocks-sharing-access-code-gate--french-locked', 'fr')
    await expect(field(page, 'Code d’accès')).toBeDisabled()
    await expect(page.getByRole('alert')).toContainText('Vous pourrez réessayer dans')
  })
})
