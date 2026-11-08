// Booking: the steps in order with focus on each step's title, free times loaded per day and
// announced, taken times, the recap with Change, required details, the confirmation and its
// calendar file, and the diary's errors. Runs on the built Storybook.
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { openStory, THEMES } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, `blocks-booking-booking--${id}`, 'dark', locale)

/** axe on the block as it is now: the later steps only exist after a few clicks. */
async function axe(page: Page, step: string) {
  const { violations } = await new AxeBuilder({ page })
    .include('#storybook-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .disableRules(['region', 'landmark-one-main', 'page-has-heading-one'])
    .analyze()
  expect(
    violations.map((v) => `${step}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([])
}

test.describe('Booking (Blocks/Booking/Booking)', () => {
  for (const theme of THEMES)
    test(`every step passes axe (${theme})`, async ({ page }) => {
      test.slow()
      await openStory(page, 'blocks-booking-booking--default', theme)
      const booking = page.getByRole('region', { name: 'Book an appointment' })
      await booking.getByText('Follow-up', { exact: true }).click()
      await booking.getByRole('button', { name: 'Continue' }).click()
      await expect(booking.getByRole('button', { name: '9:45 AM' })).toBeVisible()
      await booking.getByRole('button', { name: '9:45 AM' }).click()
      await axe(page, 'time')
      await booking.getByRole('button', { name: 'Continue' }).click()
      await booking.getByRole('button', { name: 'Confirm the appointment' }).click()
      await expect(booking.getByText('Enter your name.')).toBeVisible()
      await axe(page, 'details')
      await booking.getByRole('textbox', { name: 'Full name' }).fill('Jeanne Martin')
      await booking.getByRole('textbox', { name: 'Email' }).fill('jeanne@example.com')
      await booking.getByRole('button', { name: 'Confirm the appointment' }).click()
      await expect(booking.getByText('Your appointment is booked')).toBeVisible()
      await axe(page, 'done')
    })

  test('a service, a time, the details, then the confirmation', async ({ page }) => {
    await open(page, 'default')
    const booking = page.getByRole('region', { name: 'Book an appointment' })
    await expect(booking.getByRole('list', { name: 'Booking steps' })).toContainText('Service')
    const next = booking.getByRole('button', { name: 'Continue' })
    await expect(next).toBeDisabled()
    await booking.getByText('Follow-up', { exact: true }).click()
    await next.click()

    // The calendar step: its title takes focus, the free times are announced.
    await expect(booking.getByText('Pick a day and a time')).toBeFocused()
    await expect(booking.getByRole('status').filter({ hasText: 'available' })).toHaveText(
      '3 times available on Wednesday, October 14',
    )
    await expect(booking.getByRole('button', { name: '10:30 AM, taken' })).toBeDisabled()
    await expect(booking.getByText('Times are in Central European Time.')).toBeVisible()
    await booking.getByRole('button', { name: '9:45 AM' }).click()
    await expect(booking.getByRole('button', { name: '9:45 AM' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await booking.getByRole('button', { name: 'Continue' }).click()

    // The recap and the details.
    await expect(booking.getByText('Check and confirm')).toBeFocused()
    await expect(booking.getByRole('definition').first()).toHaveText('Follow-upChange')
    await expect(booking.getByText('Wednesday, October 14, 9:45 AM')).toBeVisible()
    const confirm = booking.getByRole('button', { name: 'Confirm the appointment' })
    await confirm.click()
    await expect(booking.getByText('Enter your name.')).toBeVisible()
    await booking.getByRole('textbox', { name: 'Full name' }).fill('Jeanne Martin')
    await booking.getByRole('textbox', { name: 'Email' }).fill('jeanne@example.com')
    await confirm.click()

    await expect(booking.getByText('Your appointment is booked')).toBeFocused()
    await expect(booking).toContainText('Reference: RDV-4821')
    const calendar = booking.getByRole('link', { name: 'Add to calendar' })
    await expect(calendar).toHaveAttribute('download', 'Follow-up.ics')
    const href = decodeURIComponent((await calendar.getAttribute('href')) ?? '')
    expect(href).toContain('DTSTART:20261014T074500Z')
    expect(href).toContain('LOCATION:12 rue Vauban\\, 69006 Lyon')

    await booking.getByRole('button', { name: 'Book another appointment' }).click()
    await expect(booking.getByText('What would you like to book?')).toBeFocused()
  })

  test('Back and Change keep what was chosen', async ({ page }) => {
    await open(page, 'default')
    const booking = page.getByRole('region', { name: 'Book an appointment' })
    await booking.getByText('First consultation', { exact: true }).click()
    await booking.getByRole('button', { name: 'Continue' }).click()
    await booking.getByRole('button', { name: 'Back' }).click()
    await expect(booking.getByRole('radio', { name: /^First consultation/ })).toBeChecked()
    await booking.getByRole('button', { name: 'Continue' }).click()
    // Another day loads its own times.
    await booking.getByRole('button', { name: /Thursday 15 October 2026/ }).click()
    await expect(booking.getByRole('status').filter({ hasText: 'available' })).toHaveText(
      /times available on Thursday, October 15/,
    )
    await booking.getByRole('button', { name: '2:00 PM' }).click()
    await booking.getByRole('button', { name: 'Continue' }).click()
    await booking.getByRole('button', { name: 'Change: When' }).click()
    await expect(booking.getByRole('button', { name: '2:00 PM' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('Sundays and holidays cannot be picked', async ({ page }) => {
    await open(page, 'one-service')
    const booking = page.getByRole('region', { name: 'Book an appointment' })
    await expect(
      booking.getByRole('list', { name: 'Booking steps' }).getByRole('listitem'),
    ).toHaveCount(2)
    await expect(booking.getByRole('button', { name: /Sunday 18 October 2026/ })).toBeDisabled()
    await expect(booking.getByRole('button', { name: /Tuesday 13 October 2026/ })).toBeDisabled()
  })

  test('the diary’s error offers Retry, and a full day says so', async ({ page }) => {
    await open(page, 'slots-error')
    await expect(page.getByRole('alert')).toContainText('The times couldn’t be loaded.')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await open(page, 'fully-booked')
    await expect(page.getByRole('status').filter({ hasText: 'No times' })).toHaveText(
      'No times left on this day. Try another one.',
    )
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  test('reads in French', async ({ page }) => {
    await open(page, 'french', 'fr')
    const booking = page.getByRole('region', { name: 'Prendre rendez-vous' })
    await booking.getByText('Suivi', { exact: true }).click()
    await booking.getByRole('button', { name: 'Continuer' }).click()
    await expect(booking.getByRole('status').filter({ hasText: 'disponibles' })).toHaveText(
      '3 horaires disponibles le mercredi 14 octobre',
    )
    await expect(booking.getByRole('button', { name: '9:45' })).toBeVisible()
  })
})
