// FormRenderer and the FormBuilder block: a form drawn from JSON, edited, previewed and exported.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('form renderer', () => {
  test('a condition shows and hides a field; hidden fields are not sent', async ({ page }) => {
    await open(page, 'components-forms-form-renderer--default')
    await expect(page.getByLabel('Company', { exact: true })).toBeVisible()
    await page.getByLabel('Just me').check()
    await expect(page.getByLabel('Company', { exact: true })).toBeHidden()
    await page.getByLabel('Full name').fill('Ada')
    await page.getByLabel('Work email').fill('ada@example.com')
    await page.getByLabel('I agree to be contacted about this request').check()
    await page.getByRole('button', { name: 'Send request' }).click()
    const values = page.getByLabel('Submitted values')
    await expect(values).toContainText('"kind": "me"')
    await expect(values).not.toContainText('company')
    await expect(values).toContainText('"phone": null')
  })

  test('Submit reports what is wrong, in the locale', async ({ page }) => {
    await open(page, 'components-forms-form-renderer--default', 'fr')
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByText('Remplissez ce champ.').first()).toBeVisible()
    await expect(page.getByText('Cochez cette case pour continuer.')).toBeVisible()
    await page.getByLabel('Work email').fill('nope')
    await page.getByLabel('Work email').blur()
    await expect(page.getByText('Saisissez une adresse e-mail.')).toBeVisible()
  })

  test('a JSON Schema becomes a form', async ({ page }) => {
    await open(page, 'components-forms-form-renderer--from-json-schema')
    await expect(page.getByRole('radio', { name: 'Production is down' })).toBeVisible()
    await expect(page.getByRole('switch', { name: 'Email me updates' })).toBeChecked()
  })
})

const BUILDER = 'blocks-forms-form-builder--'

test.describe('form builder', () => {
  test('add a field, set it in the inspector, see it in Preview and JSON', async ({ page }) => {
    await open(page, `${BUILDER}empty`)
    await page.getByRole('button', { name: 'Add field: Number' }).click()
    await expect(page.getByRole('button', { name: 'Edit Number' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.getByLabel('Label', { exact: true }).fill('Seats')
    const name = page.getByLabel('Name', { exact: true })
    await name.fill('seats')
    await name.press('Enter')
    await page.getByRole('switch', { name: 'Required' }).click()
    await expect(page.getByRole('button', { name: 'Edit Seats' })).toBeVisible()

    await page.getByRole('tab', { name: 'Preview' }).click()
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Fill in this field.')).toBeVisible()
    await page.getByRole('spinbutton', { name: 'Seats' }).fill('3')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('"seats": 3')).toBeVisible()

    await page.getByRole('tab', { name: 'JSON' }).click()
    await expect(page.getByLabel('Form as JSON')).toHaveValue(/"name": "seats"/)
  })

  test('a name already used is refused', async ({ page }) => {
    await open(page, `${BUILDER}default`)
    await page.getByRole('button', { name: 'Edit Work email' }).click()
    const name = page.getByLabel('Name', { exact: true })
    await name.fill('name')
    await expect(page.getByText('Another field already uses this name.')).toBeVisible()
    await name.blur()
    await expect(page.getByRole('button', { name: 'Edit Work email' })).toBeVisible()
    await page.getByRole('tab', { name: 'JSON' }).click()
    await expect(page.getByLabel('Form as JSON')).toHaveValue(/"name": "email"/)
  })

  test('the keyboard moves a field', async ({ page }) => {
    await open(page, `${BUILDER}default`)
    const handle = page.getByRole('button', { name: 'Move Full name' })
    await handle.focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    await page.getByRole('tab', { name: 'JSON' }).click()
    await expect(page.getByLabel('Form as JSON')).toHaveValue(
      /"name": "email"[\s\S]*"name": "name"/,
    )
  })

  test('Apply reads edited JSON and lists what it left out', async ({ page }) => {
    await open(page, `${BUILDER}empty`)
    await page.getByRole('tab', { name: 'JSON' }).click()
    await page.getByLabel('Form as JSON').fill(
      JSON.stringify({
        fields: [
          { name: 'city', type: 'text', label: 'City' },
          { name: 'city', type: 'text' },
          { name: 'x', type: 'mystery', label: 'X' },
        ],
      }),
    )
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('2 things were fixed or left out:')).toBeVisible()
    await page.getByRole('tab', { name: 'Build' }).click()
    await expect(page.getByRole('button', { name: 'Edit City' })).toBeVisible()
  })

  test('Import takes a JSON Schema', async ({ page }) => {
    await open(page, `${BUILDER}empty`)
    await page.getByRole('button', { name: 'Import' }).click()
    await page.getByLabel('FormSpec or JSON Schema').fill(
      JSON.stringify({
        type: 'object',
        properties: { plan: { type: 'string', enum: ['free', 'pro'], title: 'Plan' } },
      }),
    )
    await page.getByRole('dialog').getByRole('button', { name: 'Import' }).click()
    await expect(page.getByRole('button', { name: 'Edit Plan' })).toBeVisible()
  })
})
