// Testimonials, comparison table, changelog, blog, newsletter, cookie consent, shop and voice
// agent: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('testimonials: "Show more" reveals the rest and moves focus to the first new card', async ({
  page,
}) => {
  await open(page, 'blocks-testimonials--wall')
  const list = page.getByRole('list', { name: 'Testimonials' })
  await expect(list.getByRole('listitem')).toHaveCount(9)
  await page.getByRole('button', { name: 'Show 2 more' }).click()
  await expect(list.getByRole('listitem')).toHaveCount(11)
  await expect(list.getByRole('listitem').nth(9)).toBeFocused()
  await expect(page.getByRole('button', { name: /Show \d+ more/ })).toHaveCount(0)
  await expect(list.getByRole('img', { name: /5 out of 5/ }).first()).toBeVisible()
})

test('comparison table: cells have words; "Only show differences" hides identical rows', async ({
  page,
}) => {
  await open(page, 'blocks-comparison-table--default')
  const table = page.getByRole('table', { name: 'Compare plans' })
  const row = table.getByRole('row', { name: /Single sign-on/ })
  await expect(row.getByRole('cell')).toHaveText(['Not included', 'Not included', 'Included'])
  await expect(table.getByRole('rowheader', { name: 'Dark and light themes' })).toBeVisible()
  await page.getByRole('switch', { name: 'Only show differences' }).click()
  await expect(table.getByRole('rowheader', { name: 'Dark and light themes' })).toHaveCount(0)
  await expect(table.getByRole('rowheader', { name: /Custom roles/ })).toBeVisible()
  await table.getByRole('button', { name: 'Choose Team' }).click()
  await expect(page.getByText('Team selected')).toBeVisible()
})

test('changelog: chips filter by kind; older entries take focus when shown', async ({ page }) => {
  await open(page, 'blocks-changelog--paged')
  const articles = page.locator('[data-slot=changelog] article')
  await expect(articles).toHaveCount(2)
  await page.getByRole('button', { name: 'Show older updates' }).click()
  await expect(articles).toHaveCount(4)
  await expect(page.getByRole('article', { name: /Status pages/ })).toBeFocused()

  await page.getByRole('checkbox', { name: 'Security' }).check()
  await expect(articles).toHaveCount(1)
  await expect(articles.first()).toContainText('Links in model output')
  await expect(articles.first()).not.toContainText('daylight-saving')
})

test('blog: the category filter and "More posts"', async ({ page }) => {
  await open(page, 'blocks-blog--paged')
  const cards = page.getByRole('list', { name: 'Posts' }).getByRole('listitem')
  await expect(cards).toHaveCount(2)
  await page.getByRole('button', { name: 'More posts' }).click()
  await expect(cards).toHaveCount(4)
  await expect(
    page.getByRole('link', { name: 'What we learned translating 3,000 strings' }),
  ).toBeFocused()

  await page.getByRole('radio', { name: 'Engineering' }).check()
  await expect(cards).toHaveCount(2)
  await expect(page.getByRole('link', { name: 'Designing for the keyboard first' })).toHaveCount(0)
})

test('blog article: table of contents, reading time, related posts', async ({ page }) => {
  await open(page, 'blocks-blog--article')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Designing for the keyboard first',
  )
  await expect(page.getByText('8 min read')).toBeVisible()
  const toc = page.getByRole('navigation', { name: 'On this page' })
  await expect(toc.getByRole('link')).toHaveCount(4)
  await expect(
    page.getByRole('region', { name: 'Read next' }).getByRole('heading', { level: 3 }),
  ).toHaveCount(3)
})

test('newsletter: the address is checked, the callback error shown, then a focused thank-you', async ({
  page,
}) => {
  await open(page, 'blocks-newsletter--inline')
  const email = page.getByRole('textbox', { name: 'Email address' })
  await page.getByRole('button', { name: 'Subscribe' }).click()
  await expect(email).toHaveAccessibleDescription('Enter your email address.')
  await email.fill('ada@coreloom')
  await email.press('Enter')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await email.fill('taken@coreloom.dev')
  await email.press('Enter')
  await expect(page.getByRole('alert')).toHaveText('This address is already subscribed.')
  await email.fill('ada@coreloom.dev')
  await email.press('Enter')
  await expect(page.getByText('You’re subscribed')).toBeVisible()
  await expect(page.locator('[data-slot=newsletter] [tabindex="-1"]')).toBeFocused()
})

test('waitlist: joining shows the place in line and a link to share', async ({ page }) => {
  await open(page, 'blocks-newsletter--waitlist-form')
  await expect(page.getByText('1,204 people are waiting')).toBeVisible()
  await page.getByRole('textbox', { name: 'Email address' }).fill('ada@coreloom.dev')
  await page.getByRole('button', { name: 'Join the waitlist' }).click()
  await expect(page.getByText('You’re number 1,205 in line.')).toBeVisible()
  await expect(page.getByText('https://coreloom.dev/r/k7f2q')).toBeVisible()
})

test('cookie consent: reject all hides the banner and keeps focus on the page', async ({
  page,
}) => {
  await open(page, 'blocks-cookie-consent--in-an-app')
  const banner = page.getByRole('region', { name: 'We use cookies' })
  await page.getByRole('button', { name: 'Cookie settings' }).focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(banner.getByRole('button', { name: 'Reject all' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(banner).toHaveCount(0)
  await expect(
    page.getByText('{"necessary":true,"preferences":false,"analytics":false,"marketing":false}'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cookie settings' })).toBeFocused()
})

test('cookie consent: customize one category, then change it later from the settings', async ({
  page,
}) => {
  await open(page, 'blocks-cookie-consent--in-an-app')
  await page.getByRole('button', { name: 'Customize' }).click()
  const dialog = page.getByRole('dialog', { name: 'Cookie settings' })
  await expect(dialog.getByRole('switch', { name: 'Necessary' })).toBeDisabled()
  await dialog.getByRole('switch', { name: 'Analytics' }).click()
  await dialog.getByRole('button', { name: 'Save my choices' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'We use cookies' })).toHaveCount(0)
  await expect(page.getByText('"analytics":true,"marketing":false')).toBeVisible()
  await expect(page.locator('body')).not.toBeFocused()

  await page.getByRole('button', { name: 'Cookie settings' }).click()
  await expect(dialog.getByRole('switch', { name: 'Analytics' })).toBeChecked()
  await dialog.getByRole('button', { name: 'Accept all' }).click()
  await expect(page.getByText('"marketing":true')).toBeVisible()
})

test('shop: options follow stock; adding to the cart shows its outcome', async ({ page }) => {
  await open(page, 'blocks-shop--product-page')
  // It starts on the first variant in stock.
  await expect(page.getByRole('radio', { name: 'Sand' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Single' })).toBeChecked()
  await page.getByRole('radio', { name: 'Double' }).check()
  await expect(page.getByText('Only 3 left')).toBeVisible()
  await expect(page.getByRole('radio', { name: 'King, Sold out' })).toBeVisible()

  await page.getByRole('radio', { name: 'King, Sold out' }).check()
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
  await page.getByRole('radio', { name: 'Sage' }).check()
  await expect(page.getByText('€139')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Image 2: The linen throw in sage, folded' }),
  ).toHaveAttribute('aria-current', 'true')
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.getByText('Added to cart').first()).toBeVisible()
})

test('cart: removing a line moves focus to the next; a promo code is checked', async ({ page }) => {
  await open(page, 'blocks-shop--cart-page')
  const remove = (name: string) => page.getByRole('button', { name: `Remove ${name}` })
  await remove('Linen throw').click()
  await expect(remove('Linen throw')).toHaveCount(0)
  await expect(remove('Stoneware mug')).toBeFocused()
  await expect(page.locator('[data-slot=cart] [aria-live=polite]')).toHaveText(
    'Linen throw removed from the cart',
  )
  await expect(page.getByText('Subtotal (3 items)')).toBeVisible()

  const code = page.getByRole('textbox', { name: 'Promo code' })
  await code.fill('nope')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByRole('alert')).toHaveText('nope isn’t a valid code. Try LINEN10.')
  await code.fill('linen10')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('Code LINEN10 applied')).toBeVisible()
  await expect(page.getByText('Discount')).toBeVisible()
})

test('voice agent: hold Space to talk, let go, and the agent answers', async ({ page }) => {
  await open(page, 'blocks-ai-voice-agent--conversation')
  const talk = page.getByRole('button', { name: 'Hold to talk' })
  await expect(talk).toHaveAttribute('aria-pressed', 'false')
  await talk.focus()
  await page.keyboard.down('Space')
  await expect(talk).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-slot=voice-agent]')).toHaveAttribute('data-status', 'listening')
  await expect(page.getByText('Move the Northwind')).toBeVisible()
  await page.keyboard.up('Space')
  await expect(page.locator('[data-slot=voice-agent] [aria-live=polite]')).toHaveText('Thinking…')
  await expect(
    page.getByRole('list', { name: 'Transcript' }).getByText('The Northwind call is now at 2 p.m.'),
  ).toBeVisible()
  await expect(page.locator('[data-slot=voice-agent] [aria-live=polite]')).toHaveText(
    /^Ada: Done\. The Northwind call/,
  )
})

test('voice agent: hands-free mode toggles with a tap', async ({ page }) => {
  await open(page, 'blocks-ai-voice-agent--conversation')
  await page.getByRole('switch', { name: 'Hands-free' }).click()
  const talk = page.getByRole('button', { name: 'Start talking' })
  await talk.click()
  await expect(page.getByRole('button', { name: 'Stop talking' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Stop talking' }).click()
  await expect(page.locator('[data-slot=voice-agent]')).toHaveAttribute('data-status', 'thinking')
})
