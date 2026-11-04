// The primitives no other spec drives: keyboard paths, what each control exposes (checked, pressed,
// expanded, current) and where focus goes when an overlay closes. Most wrap Radix, so these pin
// the wiring and the Coreloom parts (labels, stepper buttons, split buttons), not Radix itself.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string) => openStory(page, id, 'dark')

test.describe('navigation', () => {
  test('tabs: arrows move between tabs and show their panel', async ({ page }) => {
    await open(page, 'components-navigation--tabs-story')
    const overview = page.getByRole('tab', { name: 'Overview' })
    await expect(overview).toHaveAttribute('aria-selected', 'true')
    await overview.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Deployments' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Deployments' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel', { name: 'Deployments' })).toHaveText(
      'Every build, newest first.',
    )
    await page.keyboard.press('End')
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeFocused()
  })

  test('breadcrumb and pagination mark the current page', async ({ page }) => {
    await open(page, 'components-navigation--breadcrumb-and-pagination')
    const trail = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(trail.getByRole('link', { name: 'Docs' })).toBeVisible()
    await expect(trail.getByText('Button')).toHaveAttribute('aria-current', 'page')
    const pages = page.getByRole('navigation', { name: 'pagination' })
    await expect(pages.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    await expect(pages.getByRole('link', { name: '3' })).not.toHaveAttribute('aria-current')
    await expect(pages.getByRole('link', { name: /previous/i })).toBeVisible()
    await expect(pages.getByRole('link', { name: /next/i })).toBeVisible()
  })

  test('menubar opens with the keyboard and arrows move between menus', async ({ page }) => {
    await open(page, 'components-navigation--menubar-story')
    const file = page.getByRole('menuitem', { name: 'File' })
    await file.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: /New project/ })).toBeVisible()
    await expect(file).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('menuitem', { name: /Toggle sidebar/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toBeHidden()
    await expect(page.getByRole('menuitem', { name: 'View' })).toBeFocused()
  })

  test('navigation menu opens its panel from the keyboard', async ({ page }) => {
    await open(page, 'components-navigation--menubar-story')
    const product = page.getByRole('button', { name: 'Product' })
    await product.focus()
    await page.keyboard.press('Enter')
    await expect(product).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('link', { name: /Theming/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(product).toHaveAttribute('aria-expanded', 'false')
    await expect(product).toBeFocused()
  })

  test('stepper: finished steps go back, the current one is announced', async ({ page }) => {
    await open(page, 'components-forms-files-tags-ranges-steps--stepper-story')
    const stepper = page.getByRole('navigation', { name: 'Progress', exact: true })
    const current = stepper.locator('[aria-current="step"]')
    await expect(current).toContainText('Workspace')
    await expect(current).toContainText('Step 2 of 4, current step')
    // Only finished steps are buttons; upcoming ones can't be jumped to.
    await expect(stepper.getByRole('button')).toHaveCount(1)
    await stepper.getByRole('button', { name: /Account/ }).click()
    await expect(current).toContainText('Account')
    await expect(stepper.getByRole('button')).toHaveCount(0)
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(current).toContainText('Invite')
    await expect(stepper.getByRole('button', { name: /Workspace.*completed/ })).toBeVisible()
  })
})

test.describe('actions', () => {
  test('toggle and toggle group expose what is pressed', async ({ page }) => {
    await open(page, 'components-actions-toggle--states')
    await expect(page.getByRole('button', { name: 'Favorite' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const terminal = page.getByRole('button', { name: 'Terminal' })
    await terminal.focus()
    await page.keyboard.press('Space')
    await expect(terminal).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled()

    await open(page, 'components-actions-toggle--group')
    // A multiple-choice group is a toolbar of toggle buttons.
    const formatting = page.getByRole('toolbar', { name: 'Formatting' })
    await formatting.getByRole('button', { name: 'Bold' }).click()
    await formatting.getByRole('button', { name: 'Italic' }).click()
    await expect(formatting.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(formatting.getByRole('button', { name: 'Italic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // A single-choice group is a radio group: one stop, arrows move, the pick stays.
    const view = page.getByRole('radiogroup', { name: 'View' })
    await expect(view.getByRole('radio', { name: 'Grid' })).toBeChecked()
    await view.getByRole('radio', { name: 'List' }).click()
    await expect(view.getByRole('radio', { name: 'List' })).toBeChecked()
    await expect(view.getByRole('radio', { name: 'Grid' })).not.toBeChecked()
  })

  test('split button: the menu half has a name and opens its options', async ({ page }) => {
    await open(page, 'components-actions-button-group--split-button')
    await expect(page.getByRole('button', { name: 'Deploy', exact: true })).toBeVisible()
    const more = page.getByRole('button', { name: 'More deploy options' })
    await more.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Deploy to staging' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(more).toBeFocused()
  })
})

test.describe('form controls', () => {
  test('checkbox, radio and switch follow their labels and the keyboard', async ({ page }) => {
    await open(page, 'components-forms-inputs--choices')
    const deploy = page.getByRole('checkbox', { name: 'Deploy on push' })
    await expect(deploy).toBeChecked()
    await expect(deploy).toHaveAccessibleDescription('Every push to main ships to production.')
    await page.getByText('Deploy on push').click()
    await expect(deploy).not.toBeChecked()

    const esm = page.getByRole('radio', { name: 'ES modules' })
    await expect(esm).toBeChecked()
    // Tab from the checkbox lands on the checked radio (one stop for the group); arrows move,
    // Space picks.
    const cjs = page.getByRole('radio', { name: 'CommonJS' })
    await deploy.focus()
    await page.keyboard.press('Tab')
    await expect(esm).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(cjs).toBeFocused()
    await page.keyboard.press('Space')
    await expect(cjs).toBeChecked()
    await expect(esm).not.toBeChecked()

    const auto = page.getByRole('switch', { name: 'Auto-deploy main' })
    await expect(auto).toBeChecked()
    await auto.focus()
    await page.keyboard.press('Space')
    await expect(auto).not.toBeChecked()
  })

  test('select opens from its label and picks with the keyboard', async ({ page }) => {
    await open(page, 'components-forms-inputs--select-field')
    const region = page.getByRole('combobox', { name: 'Region' })
    await expect(region).toHaveText('Paris (cdg1)')
    await region.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('option', { name: 'Paris (cdg1)' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Frankfurt (fra1)' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(region).toHaveText('Frankfurt (fra1)')
    await expect(region).toBeFocused()
  })

  test('slider moves by its step with arrows, Home and End', async ({ page }) => {
    await open(page, 'components-forms-inputs--slider-field')
    const slider = page.getByRole('slider', { name: 'Build concurrency' })
    await expect(slider).toHaveAttribute('aria-valuenow', '4')
    await slider.focus()
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveAttribute('aria-valuenow', '5')
    await page.keyboard.press('End')
    await expect(slider).toHaveAttribute('aria-valuenow', '16')
    await page.keyboard.press('Home')
    await expect(slider).toHaveAttribute('aria-valuenow', '1')
  })

  test('native select keeps its label, value and error', async ({ page }) => {
    await open(page, 'components-forms-native-select--default')
    const region = page.getByRole('combobox', { name: 'Region' })
    await region.selectOption('fra1')
    await expect(page.getByText('Value: fra1')).toBeVisible()

    await open(page, 'components-forms-native-select--states')
    const country = page.getByRole('combobox', { name: 'Country' })
    await expect(country).toHaveAttribute('aria-invalid', 'true')
    await expect(country).toHaveAccessibleDescription('Choose a country.')
  })
})

test.describe('disclosure', () => {
  test('accordion and collapsible expose what is open', async ({ page }) => {
    await open(page, 'components-data-display--disclosure')
    const first = page.getByRole('button', { name: 'Is it a fork of shadcn/ui?' })
    const second = page.getByRole('button', { name: 'Does it support light mode?' })
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('No — a shadcn registry with Coreloom styling.')).toBeVisible()
    // One open at a time; arrows move between headers.
    await first.focus()
    await page.keyboard.press('ArrowDown')
    await expect(second).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('Enter')
    await expect(second).toHaveAttribute('aria-expanded', 'false')

    const variables = page.getByRole('button', { name: 'Show variables' })
    await expect(variables).toHaveAttribute('aria-expanded', 'false')
    await variables.click()
    await expect(variables).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('DATABASE_URL · REDIS_URL')).toBeVisible()
  })
})

test.describe('overlays', () => {
  test('sheet: named by its title, Escape closes and focus returns', async ({ page }) => {
    await open(page, 'components-overlays--sheet-story')
    const trigger = page.getByRole('button', { name: 'Open filters' })
    await trigger.click()
    const sheet = page.getByRole('dialog', { name: 'Filters' })
    await expect(sheet).toBeVisible()
    await expect(sheet).toHaveAccessibleDescription('Narrow the deployments list.')
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('drawer: Cancel closes it and focus returns to the trigger', async ({ page }) => {
    await open(page, 'components-overlays--drawer-story')
    const trigger = page.getByRole('button', { name: 'Rename project' })
    await trigger.click()
    const drawer = page.getByRole('dialog', { name: 'Rename project' })
    await expect(drawer.getByRole('textbox', { name: 'Name' })).toHaveValue('coreloom-web')
    await drawer.getByRole('button', { name: 'Cancel' }).click()
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('popover opens and closes from the keyboard', async ({ page }) => {
    await open(page, 'components-overlays--popover-story')
    const share = page.getByRole('button', { name: 'Share' })
    await share.focus()
    await page.keyboard.press('Enter')
    await expect(share).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('textbox', { name: 'Link' })).toHaveValue(
      'https://coreloom.dev/p/8f2k',
    )
    await page.keyboard.press('Escape')
    await expect(share).toHaveAttribute('aria-expanded', 'false')
    await expect(share).toBeFocused()
  })

  test('dropdown and context menus open, move with arrows and close', async ({ page }) => {
    await open(page, 'components-overlays--menus')
    const actions = page.getByRole('button', { name: 'Actions' })
    await actions.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: /Visit/ })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Redeploy' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(actions).toBeFocused()

    await page.getByText('Right-click here').click({ button: 'right' })
    const menu = page.getByRole('menu')
    await expect(menu.getByRole('menuitem', { name: /Copy URL/ })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })

  test('tooltip shows on focus, and a toast is announced', async ({ page }) => {
    await open(page, 'components-overlays--tooltip-and-toast')
    await page.getByRole('button', { name: 'Copy' }).focus()
    await expect(page.getByRole('tooltip', { name: 'Copy' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toBeHidden()

    await page.getByRole('button', { name: 'Show a toast' }).click()
    const toasts = page.getByRole('region', { name: /Notifications/ })
    await expect(toasts.getByText('Deployed to production')).toBeVisible()
    await expect(toasts.getByText('coreloom-web · 38s')).toBeVisible()
  })
})

test.describe('layout and media', () => {
  test('resizable handles move with the keyboard', async ({ page }) => {
    await open(page, 'components-layout-utilities--resizable-story')
    const handle = page.getByRole('separator').first()
    const before = Number(await handle.getAttribute('aria-valuenow'))
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect
      .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(before)
  })

  test('scroll area scrolls with the keyboard once focused', async ({ page }) => {
    await open(page, 'components-layout-utilities--scroll-area-story')
    const viewport = page.locator('[data-slot="scroll-area-viewport"]')
    await viewport.focus()
    await expect(viewport).toBeFocused()
    await page.keyboard.press('End')
    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })

  test('carousel arrows page through and stop at the ends', async ({ page }) => {
    await open(page, 'components-charts-media--carousel-story')
    const previous = page.getByRole('button', { name: /previous slide/i })
    const next = page.getByRole('button', { name: /next slide/i })
    await expect(page.locator('[aria-roledescription="carousel"]')).toBeVisible()
    await expect(previous).toBeDisabled()
    // Two slides show at once: the arrows page until the last one is in view. The keyboard drives
    // them (a pointer click can land on the sliding track while it moves).
    await next.focus()
    await page.keyboard.press('Enter')
    await expect(previous).toBeEnabled()
    await expect
      .poll(async () => {
        if (await next.isEnabled()) await page.keyboard.press('Enter')
        return next.isDisabled()
      })
      .toBe(true)
    await expect(page.getByText('Slide 5')).toBeInViewport()
    await previous.focus()
    await page.keyboard.press('Enter')
    await expect(next).toBeEnabled()
  })
})
