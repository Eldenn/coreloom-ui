// Lists where several options can be picked: a screen reader hears which ones are checked,
// whichever option the keyboard highlight is on.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test('faceted filter: picked options are announced as checked, apart from the highlight', async ({
  page,
}) => {
  await open(page, 'blocks-data-list--faceted-filter-alone')
  await page.getByRole('button', { name: 'Filter by Status' }).press('Enter')
  const list = page.getByRole('listbox')
  await expect(list).toHaveAttribute('aria-multiselectable', 'true')

  const failed = list.getByRole('option', { name: /Failed/ })
  const ready = list.getByRole('option', { name: /Ready/ })
  // The highlight sits on Ready, not on the picked option.
  await expect(ready).toHaveAttribute('aria-selected', 'true')
  await expect(failed).toBeChecked()
  await expect(ready).not.toBeChecked()

  await page.keyboard.press('Enter')
  await expect(ready).toBeChecked()
  await page.keyboard.press('Enter')
  await expect(ready).not.toBeChecked()
  await expect(failed).toBeChecked()
})

test('multi-select: picked options are announced as checked, apart from the highlight', async ({
  page,
}) => {
  await open(page, 'components-forms-multi-select-money-phone-typed-dates--multi-select-story')
  await page.getByRole('combobox', { name: /Regions|Paris/ }).click()
  const list = page.getByRole('listbox')
  const tokyo = list.getByRole('option', { name: 'Tokyo (hnd1)' })
  const paris = list.getByRole('option', { name: 'Paris (cdg1)' })
  await expect(paris).toBeChecked()
  await expect(tokyo).not.toBeChecked()

  await page.keyboard.type('tok')
  await expect(tokyo).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Enter')
  await expect(tokyo).toBeChecked()
  await page.getByPlaceholder('Search…').fill('')
  await expect(paris).toBeChecked()
})
