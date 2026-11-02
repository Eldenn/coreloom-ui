// Code editor and IDE block: what people do and get.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)

test('code editor: a labelled text box that edits, and Escape then Tab leaves it', async ({
  page,
}) => {
  await open(page, 'components-forms-code-editor--in-a-form')
  const editor = page.getByRole('textbox', { name: 'Transform script' })
  await expect(editor).toHaveAttribute('aria-multiline', 'true')
  await editor.click()
  await page.keyboard.type('return 1')
  await expect(editor).toContainText('return 1')
  // Tab indents inside the editor…
  await page.keyboard.press('Tab')
  await expect(editor).toBeFocused()
  // …until Escape: then Tab moves on.
  await page.keyboard.press('Escape')
  await page.keyboard.press('Tab')
  await expect(editor).not.toBeFocused()
})

test('code editor: read only, and CodeMirror’s words follow the locale', async ({ page }) => {
  await open(page, 'components-forms-code-editor--read-only')
  await expect(page.getByRole('textbox', { name: 'Code' })).toHaveAttribute('aria-readonly', 'true')
  await open(page, 'components-forms-code-editor--french', 'fr')
  await page.getByRole('textbox', { name: 'Code' }).click()
  await page.keyboard.press('ControlOrMeta+f')
  await expect(page.getByRole('textbox', { name: 'Rechercher', exact: true })).toBeFocused()
})

const ide = (page: Page) => page.getByRole('region', { name: 'Code editor' })
const tab = (page: Page, name: string | RegExp) =>
  ide(page).getByRole('tablist', { name: 'Open files' }).getByRole('tab', { name })

test('ide: open from the explorer, edit, save with Mod-S', async ({ page }) => {
  await open(page, 'blocks-developer-ide--default')
  const explorer = ide(page).getByRole('tree', { name: 'Explorer' })
  await explorer.getByRole('treeitem', { name: 'components', exact: true }).click()
  await explorer.getByRole('treeitem', { name: 'stat-card.tsx', exact: true }).click()
  await expect(tab(page, 'stat-card.tsx')).toHaveAttribute('aria-selected', 'true')
  const editor = ide(page).getByRole('textbox', { name: 'Edit src/components/stat-card.tsx' })
  await expect(editor).toBeFocused()
  await page.keyboard.type('// hello\n')
  await expect(tab(page, 'stat-card.tsx, modified')).toBeVisible()
  await expect(ide(page).getByText('Unsaved changes')).toBeVisible()
  await page.keyboard.press('ControlOrMeta+s')
  await expect(ide(page).getByRole('status')).toHaveText('stat-card.tsx saved')
  await expect(tab(page, 'stat-card.tsx')).toBeVisible()
  await expect(ide(page).getByText('Ln 2, Col 1')).toBeVisible()
})

test('ide: Mod-P finds a file, tabs move with the arrows and close with Delete', async ({
  page,
}) => {
  await open(page, 'blocks-developer-ide--default')
  await tab(page, 'app.tsx').click()
  await page.keyboard.press('ControlOrMeta+p')
  const palette = page.getByRole('dialog', { name: 'Go to file' })
  await palette.getByRole('combobox').fill('seed')
  await page.keyboard.press('Enter')
  await expect(palette).toBeHidden()
  await expect(tab(page, 'seed.py')).toHaveAttribute('aria-selected', 'true')
  await expect(ide(page).getByText('Python', { exact: true })).toBeVisible()

  await tab(page, 'seed.py').focus()
  await page.keyboard.press('ArrowLeft')
  await expect(tab(page, 'format.ts')).toBeFocused()
  await expect(tab(page, 'format.ts')).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Delete')
  await expect(tab(page, 'format.ts')).toHaveCount(0)
  await expect(tab(page, 'seed.py')).toBeFocused()
})

test('ide: new file checks its path, then opens; delete asks first', async ({ page }) => {
  await open(page, 'blocks-developer-ide--default')
  await ide(page).getByRole('button', { name: 'New file' }).click()
  const dialog = page.getByRole('dialog', { name: 'New file' })
  const path = dialog.getByRole('textbox', { name: 'Path' })
  await path.fill('src/app.tsx')
  await dialog.getByRole('button', { name: 'Create' }).click()
  await expect(path).toHaveAttribute('aria-invalid', 'true')
  await expect(path).toHaveAccessibleDescription('A file or folder already has this path.')
  await path.fill('src/hooks/use-range.ts')
  await page.keyboard.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(tab(page, 'use-range.ts')).toHaveAttribute('aria-selected', 'true')
  await expect(ide(page).getByRole('treeitem', { name: 'use-range.ts', exact: true })).toBeVisible()
  await expect(ide(page).getByRole('status')).toHaveText('use-range.ts created')

  await page.keyboard.press('ControlOrMeta+Shift+p')
  await page.getByRole('dialog', { name: 'Commands' }).getByRole('combobox').fill('delete')
  await page.keyboard.press('Enter')
  const confirm = page.getByRole('alertdialog', { name: 'Delete use-range.ts?' })
  await confirm.getByRole('button', { name: 'Delete' }).click()
  await expect(tab(page, 'use-range.ts')).toHaveCount(0)
  await expect(ide(page).getByRole('treeitem', { name: 'use-range.ts', exact: true })).toHaveCount(
    0,
  )
})

test('ide: a problem opens its file at its line', async ({ page }) => {
  await open(page, 'blocks-developer-ide--with-problems')
  const problems = ide(page).getByRole('list', { name: 'Problems' })
  await expect(problems.getByRole('listitem')).toHaveCount(3)
  await problems.getByRole('button', { name: /Unexpected console statement/ }).click()
  await expect(tab(page, 'app.tsx')).toHaveAttribute('aria-selected', 'true')
  await expect(ide(page).getByRole('textbox', { name: 'Edit src/app.tsx' })).toBeFocused()
  await expect(ide(page).getByText('Ln 10, Col 3', { exact: true })).toBeVisible()
  // The status bar's counts open the panel too.
  await expect(ide(page).getByRole('button', { name: '1 error, 1 warning' })).toBeVisible()
})

test('ide: Mod-B and Mod-J show and hide the explorer and the panel', async ({ page }) => {
  await open(page, 'blocks-developer-ide--default')
  await tab(page, 'app.tsx').focus()
  await page.keyboard.press('ControlOrMeta+b')
  await expect(ide(page).getByRole('tree', { name: 'Explorer' })).toBeHidden()
  await page.keyboard.press('ControlOrMeta+j')
  await expect(ide(page).getByRole('tab', { name: 'Problems' })).toBeVisible()
  await expect(ide(page).getByRole('button', { name: 'Show or hide the panel' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('ide: at phone width the explorer is a sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, 'blocks-developer-ide--phone')
  await expect(ide(page).getByRole('tree', { name: 'Explorer' })).toHaveCount(0)
  await ide(page).getByRole('button', { name: 'Show or hide the explorer' }).click()
  const sheet = page.getByRole('dialog', { name: 'Explorer' })
  await sheet.getByRole('treeitem', { name: 'README.md', exact: true }).click()
  await expect(sheet).toBeHidden()
  await expect(tab(page, 'README.md')).toHaveAttribute('aria-selected', 'true')
})
