// Input group, number input and time picker: what a user types and presses, and what they get back.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test.describe('input group', () => {
  test('password: the toggle shows the text and says it is pressed', async ({ page }) => {
    await open(page, 'components-forms-input-group--password')
    const field = page.getByLabel('Password', { exact: true })
    await expect(field).toHaveAttribute('type', 'password')
    const toggle = page.getByRole('button', { name: 'Show password' })
    await toggle.click()
    await expect(field).toHaveAttribute('type', 'text')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  test('search: clear button and Escape empty the field and keep focus there', async ({ page }) => {
    await open(page, 'components-forms-input-group--search')
    const field = page.getByLabel('Find a component')
    await page.getByRole('button', { name: 'Clear search' }).click()
    await expect(field).toHaveValue('')
    await expect(field).toBeFocused()
    await expect(page.getByRole('button', { name: 'Clear search' })).toBeHidden()
    await field.fill('chart')
    await field.press('Escape')
    await expect(page.getByText('Query: empty')).toBeVisible()
  })

  test('a click on an addon focuses the field', async ({ page }) => {
    await open(page, 'components-forms-input-group--addons')
    await page.getByText('https://').click()
    await expect(page.getByLabel('Website')).toBeFocused()
  })
})

const NUMBER = 'components-forms-number-input--'

test.describe('number input', () => {
  test('arrows, Page keys and Home/End step within the bounds', async ({ page }) => {
    await open(page, `${NUMBER}in-fields`)
    const seats = page.getByRole('spinbutton', { name: 'Seats' })
    await seats.press('ArrowUp')
    await expect(seats).toHaveValue('13')
    await seats.press('PageDown')
    await expect(seats).toHaveValue('3')
    await seats.press('Home')
    await expect(seats).toHaveValue('1')
    await expect(page.getByRole('button', { name: 'Decrease' }).first()).toBeDisabled()
    await seats.press('End')
    await expect(seats).toHaveAttribute('aria-valuenow', '500')
  })

  test('typed values are clamped and formatted on blur; percents are fractions', async ({
    page,
  }) => {
    await open(page, `${NUMBER}in-fields`)
    const seats = page.getByRole('spinbutton', { name: 'Seats' })
    await seats.fill('1200')
    await seats.blur()
    await expect(seats).toHaveValue('500')
    await expect(page.getByText('Value: 500')).toBeVisible()
    const discount = page.getByRole('spinbutton', { name: 'Discount' })
    await discount.fill('20 %')
    await discount.blur()
    await expect(page.getByText('Value: 0.2')).toBeVisible()
    await discount.press('ArrowUp')
    await expect(page.getByText('Value: 0.25')).toBeVisible()
  })

  test('the + button steps and keeps focus in the field', async ({ page }) => {
    await open(page, `${NUMBER}sides`)
    const guests = page.getByRole('spinbutton', { name: 'Guests' })
    await page.getByRole('button', { name: 'Increase' }).click()
    await expect(guests).toHaveValue('3')
    await expect(guests).toBeFocused()
  })

  test('French reads commas and spaces', async ({ page }) => {
    await open(page, `${NUMBER}french`, 'fr')
    const field = page.getByRole('spinbutton', { name: 'Surface (m²)' })
    await field.fill('2 500,5')
    await field.blur()
    await expect(page.getByText('Valeur : 2500.5')).toBeVisible()
  })
})

const TIME = 'components-forms-time-picker--'

test.describe('time picker', () => {
  test('typed times are read and shown in the reader’s clock', async ({ page }) => {
    await open(page, `${TIME}default`)
    const field = page.getByLabel('Starts at')
    await field.fill('9h15')
    await field.blur()
    await expect(page.getByText('Value: 09:15')).toBeVisible()
    await expect(field).toHaveValue(/^9:15\sAM$/)
    await field.fill('25:00')
    await field.blur()
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText(/Enter a time as hh:mm/)).toBeVisible()
  })

  test('the list picks with the keyboard and gives focus back', async ({ page }) => {
    await open(page, `${TIME}default`)
    await page.getByRole('button', { name: 'Choose from a list' }).click()
    const list = page.getByRole('listbox', { name: 'Times' })
    await expect(list).toBeFocused()
    await expect(page.getByRole('option', { name: /^2:30\sPM$/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(list).toBeHidden()
    await expect(page.getByText('Value: 15:00')).toBeVisible()
    await expect(page.getByLabel('Starts at')).toBeFocused()
  })

  test('date and time: changing the time keeps the day', async ({ page }) => {
    await open(page, `${TIME}date-and-time`)
    const time = page.getByLabel('Time', { exact: true })
    await time.fill('16:45')
    await time.blur()
    await expect(page.getByText('Value: Wed Oct 14 2026 16:45')).toBeVisible()
  })

  test('French shows 24-hour time', async ({ page }) => {
    await open(page, `${TIME}french`, 'fr')
    await expect(page.getByLabel('Début')).toHaveValue('14:30')
    await expect(page.getByLabel('Heure', { exact: true })).toHaveValue('09:30')
  })
})
