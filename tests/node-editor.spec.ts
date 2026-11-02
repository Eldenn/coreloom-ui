// Node editor, workflow builder and agent builder: adding nodes from the list, connecting and
// disconnecting from the panel (the keyboard path), drawing a connection with the pointer, deleting
// and undoing, required settings, Run waiting on issues, and the LangGraph JSON round trip.
// Runs on the built Storybook, in the dark theme.
import { expect, type Page, test } from '@playwright/test'

import { openStory } from './stories'

const open = (page: Page, id: string, locale: 'en' | 'fr' = 'en') =>
  openStory(page, id, 'dark', locale)
const canvas = (page: Page, name = 'Workflow') => page.getByRole('application', { name })
// A node is named "Name, kind, …".
const node = (page: Page, name: string, canvasName?: string) =>
  canvas(page, canvasName).getByRole('group', { name: new RegExp(`^${name}(,|$)`) })
const panel = (page: Page) => page.getByRole('complementary', { name: 'Node settings' })
const edges = (page: Page) => page.locator('.react-flow__edge')

test.describe('Node editor (Components/Workflow/Node editor)', () => {
  test('adds a node from the list after the selected one, connected to it', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    await expect(edges(page)).toHaveCount(4)
    await page.getByRole('button', { name: 'Add node' }).click()
    await page.getByPlaceholder('Search nodes…').fill('wait')
    await page.keyboard.press('Enter')
    await expect(node(page, 'Wait')).toBeVisible()
    await expect(panel(page)).toContainText('Pauses before the next step.')
    await expect(
      panel(page).getByRole('listitem').filter({ hasText: 'Business email?' }),
    ).toBeVisible()
    await expect(edges(page)).toHaveCount(5)
    await expect(page.getByText('Wait added.')).toBeAttached()
  })

  test('connects and disconnects from the panel, and undo puts it back', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    const p = panel(page)
    await p
      .getByRole('button', { name: 'Remove the connection from Business email? to Welcome email' })
      .click()
    await expect(edges(page)).toHaveCount(3)
    await expect(node(page, 'Welcome email')).toHaveAccessibleName(/1 issue/)

    await p.getByRole('combobox', { name: /“false” goes to/ }).click()
    await page.getByRole('option', { name: 'Welcome email' }).click()
    await expect(edges(page)).toHaveCount(4)
    await expect(p.getByRole('button', { name: /to Welcome email$/ })).toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(edges(page)).toHaveCount(3)
    await page.getByRole('button', { name: 'Redo' }).click()
    await expect(edges(page)).toHaveCount(4)
  })

  test('draws a connection from an output to an input with the pointer', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    await expect(edges(page)).toHaveCount(4)
    const from = node(page, 'Welcome email').locator('.react-flow__handle.source')
    const to = node(page, 'Tell sales').locator('.react-flow__handle.target')
    await from.hover()
    await page.mouse.down()
    const box = await to.boundingBox()
    if (!box) throw new Error('no target handle')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(edges(page)).toHaveCount(5)
  })

  test('deletes the focused node with the keyboard; Ctrl+Z brings it back', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const email = node(page, 'Welcome email')
    await email.focus()
    await page.keyboard.press('Enter')
    await expect(panel(page)).toContainText('Welcome email')
    await page.keyboard.press('Delete')
    await expect(email).toHaveCount(0)
    await expect(edges(page)).toHaveCount(3)
    // Focus doesn't fall to <body> with the node: it lands on "Add node", inside the editor.
    await expect(page.getByRole('button', { name: 'Add node' })).toBeFocused()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(node(page, 'Welcome email')).toBeVisible()
    await expect(edges(page)).toHaveCount(4)
  })

  test('the panel deletes a node and focus stays in the editor', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--selected')
    await panel(page).getByRole('button', { name: 'Delete node' }).click()
    await expect(node(page, 'Business email?')).toHaveCount(0)
    await expect(panel(page)).toContainText('Select a node to configure it.')
    await expect(page.getByRole('button', { name: 'Add node' })).toBeFocused()
  })

  test('settings edit the node; a required one left empty is flagged', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--needs-attention')
    const p = panel(page)
    const to = p.getByRole('textbox', { name: /^To/ })
    await expect(to).toHaveAttribute('aria-invalid', 'true')
    await expect(to).toHaveAccessibleDescription('Required.')
    await to.fill('{{email}}')
    await expect(to).not.toHaveAttribute('aria-invalid')
    await p.getByRole('textbox', { name: 'Name' }).fill('Say hello')
    await expect(node(page, 'Say hello')).toBeVisible()
  })

  test('read-only: no list to add from, no editing in the panel', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--read-only')
    await expect(page.getByRole('button', { name: 'Add node' })).toHaveCount(0)
    await expect(panel(page).getByRole('textbox', { name: 'Name' })).toHaveAttribute('readonly', '')
    await expect(panel(page).getByRole('button', { name: 'Delete node' })).toHaveCount(0)
  })

  test('a run shows on the cards', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--failed')
    await expect(node(page, 'Enrich company')).toHaveAccessibleName(/Failed/)
    await expect(panel(page)).toContainText('Failed · 404 Not found')
  })

  test('French', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--french', 'fr')
    await expect(page.getByRole('button', { name: 'Ajouter un nœud', exact: true })).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'Réglages du nœud' })).toContainText(
      '« true » va vers',
    )
  })
})

test.describe('Node data, expressions and fields (Components/Workflow/Node editor)', () => {
  test('Input and Output show what the node received and gave', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    const p = panel(page)
    await p.getByRole('tab', { name: 'Input' }).click()
    await expect(p.getByRole('tabpanel')).toContainText('1 item')
    await expect(p.getByRole('tabpanel')).toContainText('Analytical')
    await p.getByRole('tab', { name: 'Output' }).click()
    await expect(p.getByRole('tabpanel')).toContainText('No output yet.')
    await node(page, 'Enrich company').click()
    await panel(page).getByRole('tab', { name: 'Output' }).click()
    await expect(panel(page).getByRole('tabpanel')).toContainText('Computing')
  })

  test('typing {{ suggests the input’s fields; Enter inserts one and the preview fills it', async ({
    page,
  }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    const message = panel(page).getByRole('textbox', { name: 'Message' })
    await expect(panel(page)).toContainText('New signup from Analytical')
    await message.fill('')
    await message.pressSequentially('Sector: {{ company.ind')
    const list = page.getByRole('listbox', { name: 'Insert a value' })
    await expect(list.getByRole('option').first()).toHaveText(/^company\.industry/)
    await expect(message).toHaveAttribute('aria-activedescendant', /.+/)
    await page.keyboard.press('Enter')
    await expect(list).toHaveCount(0)
    await expect(message).toHaveValue('Sector: {{ company.industry }}')
    await expect(panel(page)).toContainText('Sector: Computing')
    // Escape closes the list and leaves the text alone.
    await message.pressSequentially(' {{ ')
    await expect(list).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(list).toHaveCount(0)
    await expect(message).toHaveValue('Sector: {{ company.industry }} {{ ')
  })

  test('the braces button opens the list where the caret is', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    await panel(page).getByRole('button', { name: 'Insert a value' }).first().click()
    const list = page.getByRole('listbox', { name: 'Insert a value' })
    await expect(list.getByRole('option', { name: /^\$node\.webhook\.email/ })).toBeAttached()
    await list.getByRole('option', { name: /^status/ }).click()
    await expect(panel(page).getByRole('textbox', { name: 'Channel' })).toHaveValue(
      '#sales{{ status }}',
    )
  })

  test('Test node runs the node through the app and shows its output', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--test-node')
    const p = panel(page)
    await p.getByRole('button', { name: 'Test node' }).click()
    await expect(p.getByRole('tab', { name: 'Output' })).toHaveAttribute('aria-selected', 'true')
    await expect(p.getByRole('tabpanel')).toContainText('employees')
    await expect(node(page, 'Enrich company')).toHaveAccessibleName(/Done/)
    await expect(page.getByText('Enrich company tested: Done.')).toBeAttached()
  })

  test('conditions: add one, match all or any, remove it; the sample says if they hold', async ({
    page,
  }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    await node(page, 'Business email\\?').click()
    const p = panel(page)
    await expect(p).toContainText('With the sample input: true.')
    await p.getByRole('button', { name: 'Add a condition' }).click()
    const second = p.getByRole('group', { name: 'Condition 2' })
    await expect(second.getByRole('textbox', { name: 'Value' })).toBeFocused()
    await expect(p.getByRole('combobox', { name: 'Match' })).toBeVisible()
    await second.getByRole('button', { name: 'Remove condition 2' }).click()
    await expect(second).toHaveCount(0)
    await expect(p.getByRole('button', { name: 'Add a condition' })).toBeFocused()
  })

  test('a JSON body that doesn’t parse is flagged until fixed', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--fields')
    const body = panel(page).getByRole('textbox', { name: 'Body' })
    await expect(body).toHaveAttribute('aria-invalid', 'true')
    await expect(body).toHaveAccessibleDescription('Not valid JSON.')
    await expect(page.getByText('1 node needs attention')).toBeVisible()
    await body.fill('{ "domain": "analytical.io" }')
    await expect(body).not.toHaveAttribute('aria-invalid')
    await expect(page.getByText('1 node needs attention')).toHaveCount(0)
  })

  test('key/value rows: add one, its key takes focus', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--fields')
    const p = panel(page)
    await expect(p.getByRole('combobox', { name: 'Credential' })).toHaveText('CRM API key')
    await p.getByRole('button', { name: 'Add a row' }).click()
    await expect(
      p.getByRole('group', { name: 'Row 2' }).getByRole('textbox', { name: 'Key' }),
    ).toBeFocused()
  })
})

test.describe('Quick editing (Components/Workflow/Node editor)', () => {
  test('the “+” after an open output adds a connected node, and focus lands on it', async ({
    page,
  }) => {
    await open(page, 'components-workflow-node-editor--default')
    await expect(edges(page)).toHaveCount(4)
    await page.getByRole('button', { name: 'Add a node after Tell sales' }).click()
    await page.getByPlaceholder('Search nodes…').fill('wait')
    await page.keyboard.press('Enter')
    await expect(node(page, 'Wait')).toBeFocused()
    await expect(edges(page)).toHaveCount(5)
    await expect(panel(page)).toContainText('Tell sales')
  })

  test('the “+” on a connection puts a node in between', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    await page
      .getByRole('button', { name: 'Add a node between New signup and Business email?' })
      .click()
    await page.getByPlaceholder('Search nodes…').fill('wait')
    await page.keyboard.press('Enter')
    await expect(edges(page)).toHaveCount(5)
    await expect(
      page.locator('.react-flow__edge[aria-label="From New signup to Wait"]'),
    ).toHaveCount(1)
    await expect(
      page.locator('.react-flow__edge[aria-label="From Wait to Business email?"]'),
    ).toHaveCount(1)
  })

  test('copy and paste a node with the keyboard', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const email = node(page, 'Welcome email')
    await email.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('ControlOrMeta+c')
    await expect(page.getByText('Node copied.')).toBeAttached()
    await page.keyboard.press('ControlOrMeta+v')
    await expect(node(page, 'Welcome email 2')).toBeVisible()
    await expect(page.getByText('Node pasted.')).toBeAttached()
    await page.keyboard.press('ControlOrMeta+z')
    await expect(node(page, 'Welcome email 2')).toHaveCount(0)
  })

  test('right-click a node to disable it; D turns it back on', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const sales = node(page, 'Tell sales')
    await sales.click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Disable' }).click()
    await expect(sales).toHaveAccessibleName(/Disabled/)
    await sales.focus()
    await page.keyboard.press('d')
    await expect(sales).not.toHaveAccessibleName(/Disabled/)
    await expect(page.getByText('Tell sales enabled.')).toBeAttached()
  })

  test('right-click the canvas to add a node there', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    const box = await canvas(page).boundingBox()
    if (!box) throw new Error('no canvas')
    await page.mouse.click(box.x + 60, box.y + box.height - 60, { button: 'right' })
    await page.getByRole('menuitem', { name: 'Add a node here' }).click()
    await page.getByPlaceholder('Search nodes…').fill('schedule')
    await page.keyboard.press('Enter')
    await expect(node(page, 'Schedule')).toBeFocused()
  })

  test('sample data pinned to the trigger reaches the nodes after it', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--default')
    await node(page, 'New signup').click()
    const p = panel(page)
    await p.getByRole('tab', { name: 'Output' }).click()
    await p.getByRole('button', { name: 'Add sample data' }).click()
    const json = p.getByRole('textbox', { name: 'Sample data (JSON)' })
    await expect(json).toBeFocused()
    await json.fill('[{ "email": "grace@navy.mil" ')
    await expect(p.getByRole('button', { name: 'Pin', exact: true })).toBeDisabled()
    await json.fill('[{ "email": "grace@navy.mil" }]')
    await p.getByRole('button', { name: 'Pin', exact: true }).click()
    await expect(node(page, 'New signup')).toHaveAccessibleName(/Pinned data/)
    await expect(p.getByRole('tabpanel')).toContainText('grace@navy.mil')
    // Two steps on, through the If: Welcome email's "To" is previewed from the pin.
    await node(page, 'Welcome email').click()
    await expect(panel(page)).toContainText('grace@navy.mil')
    await node(page, 'New signup').click()
    await panel(page).getByRole('tab', { name: 'Output' }).click()
    await panel(page).getByRole('button', { name: 'Unpin' }).click()
    await expect(node(page, 'New signup')).not.toHaveAccessibleName(/Pinned data/)
  })

  test('a run’s output can be pinned', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    await node(page, 'Enrich company').click()
    await panel(page).getByRole('tab', { name: 'Output' }).click()
    await panel(page).getByRole('button', { name: 'Pin this output' }).click()
    await expect(node(page, 'Enrich company')).toHaveAccessibleName(/Pinned data/)
  })

  test('drag a field from Input onto a setting', async ({ page }) => {
    await open(page, 'components-workflow-node-editor--with-data')
    const p = panel(page)
    await p.getByRole('tab', { name: 'Input' }).click()
    const field = p.getByRole('tabpanel').getByText('status', { exact: true })
    await field.hover()
    await page.mouse.down()
    const tab = await p.getByRole('tab', { name: 'Settings' }).boundingBox()
    if (!tab) throw new Error('no tab')
    await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2, { steps: 6 })
    const channel = p.getByRole('textbox', { name: 'Channel' })
    const box = await channel.boundingBox()
    if (!box) throw new Error('no field')
    await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 6 })
    await page.mouse.up()
    await expect(channel).toHaveValue(/\{\{ status \}\}/)
  })
})

test.describe('Workflow builder (Blocks/Workflow/Workflow builder)', () => {
  test('Run waits until the flagged nodes are fixed', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--needs-attention')
    const run = page.getByRole('button', { name: 'Run' })
    await expect(run).toBeDisabled()
    await expect(run).toHaveAccessibleDescription('Fix 3 nodes before running.')
  })

  test('Run reports each node; Save confirms', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--default')
    await page.getByRole('button', { name: 'Run' }).click()
    await expect(node(page, 'Tell sales')).toHaveAccessibleName(/Done/, { timeout: 5000 })
    await expect(node(page, 'Welcome email')).toHaveAccessibleName(/Skipped/)
    await page.getByRole('textbox', { name: 'Workflow name' }).fill('Signups')
    await expect(page.getByRole('status').filter({ hasText: 'Unsaved changes' })).toBeVisible()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible()
  })

  test('a failed save says so', async ({ page }) => {
    await open(page, 'blocks-workflow-workflow-builder--save-failed')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status')).toContainText('Couldn’t save. Try again.')
  })
})

test.describe('Agent builder (Blocks/AI/Agent builder)', () => {
  const graph = 'Agent graph'

  test('a router has one output per route; removing a route drops its connection', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await node(page, 'Who’s next\\?', graph).click()
    const p = panel(page)
    await expect(p.getByText('“write” goes to')).toBeVisible()
    const before = await edges(page).count()
    await p.getByRole('button', { name: /Remove write/i }).click()
    await expect(p.getByText('“write” goes to')).toHaveCount(0)
    await expect(edges(page)).toHaveCount(before - 1)
  })

  test('the agent panel lists the {{variables}} in its instructions', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--agent-selected')
    const instructions = panel(page).getByRole('textbox', { name: /^Instructions/ })
    await instructions.fill('Research {{topic}} for {{audience}}.')
    await expect(panel(page)).toContainText('Variables: topic, audience')
  })

  test('state fields: add one, then remove it', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await page.getByRole('button', { name: 'State' }).click()
    const dialog = page.getByRole('dialog', { name: 'State' })
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveCount(3)
    await dialog.getByRole('button', { name: 'Add a field' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Name' }).last()).toBeFocused()
    await page.keyboard.type('x')
    await dialog.getByRole('button', { name: 'Remove fieldx' }).click()
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toHaveCount(3)
  })

  test('LangGraph JSON: export shows the conditional edges, import rebuilds the graph', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-builder--default')
    await page.getByRole('button', { name: 'LangGraph JSON' }).click()
    const dialog = page.getByRole('dialog', { name: 'LangGraph JSON' })
    const json = dialog.getByRole('textbox', { name: 'LangGraph JSON' })
    await expect(json).toHaveValue(/"conditional": true/)
    await expect(json).toHaveValue(/"data": "research"/)

    await json.fill('{"nodes": []}')
    await dialog.getByRole('button', { name: 'Import' }).click()
    await expect(dialog.getByRole('alert')).toContainText('This isn’t a LangGraph graph')

    await json.fill(
      JSON.stringify({
        nodes: [
          { id: '__start__', type: 'schema', data: '__start__' },
          { id: 'agent', type: 'runnable', data: { name: 'agent' } },
          {
            id: 'tools',
            type: 'runnable',
            data: { id: ['langgraph', 'prebuilt', 'tool_node', 'ToolNode'] },
          },
          { id: '__end__', type: 'schema', data: '__end__' },
        ],
        edges: [
          { source: '__start__', target: 'agent' },
          { source: 'agent', target: 'tools', conditional: true },
          { source: 'agent', target: '__end__', conditional: true },
          { source: 'tools', target: 'agent' },
        ],
      }),
    )
    await dialog.getByRole('button', { name: 'Import' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(node(page, 'Router', graph)).toBeVisible()
    await expect(node(page, 'Tools', graph)).toBeVisible()
    await expect(node(page, 'Researcher', graph)).toHaveCount(0)
  })
  test('an agent fixes a tool parameter and names the state it writes', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--agent-selected')
    const p = panel(page)
    const params = p.getByRole('group', { name: 'Tool parameters' })
    await expect(params.getByRole('textbox', { name: /^max_results/ })).toHaveValue('5')
    await params.getByRole('textbox', { name: /^query/ }).fill('{{ topic }} news')
    await expect(params.getByRole('textbox', { name: /^query/ })).toHaveValue('{{ topic }} news')
    await expect(p.getByRole('combobox', { name: 'Writes' })).toContainText('sources')
    await expect(node(page, 'Researcher', graph)).toContainText('→ sources')
  })

  test('structured output must be valid JSON', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--structured-output')
    await expect(node(page, 'Writer', graph)).toContainText('Structured')
    const schema = panel(page).getByRole('textbox', { name: /^Structured output/ })
    await schema.fill('{ "type": ')
    await expect(panel(page)).toContainText('JSON')
    await expect(schema).toHaveAttribute('aria-invalid', 'true')
  })

  test('picking a sensitive tool asks before running it', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--agent-selected')
    const p = panel(page)
    await p.getByRole('combobox', { name: 'Tools' }).click()
    await page.getByRole('option', { name: 'Send email' }).click()
    await page.keyboard.press('Escape')
    await expect(p.getByRole('combobox', { name: 'Ask before running' })).toContainText(
      'Send email',
    )
  })

  test('a node set to pause shows in the LangGraph JSON and the state dialog has a limit', async ({
    page,
  }) => {
    await open(page, 'blocks-ai-agent-builder--agent-selected')
    await panel(page).getByRole('combobox', { name: 'Pause the run' }).click()
    await page.getByRole('option', { name: 'After this step' }).click()
    await expect(node(page, 'Researcher', graph)).toContainText('Pauses')

    await page.getByRole('button', { name: 'State' }).click()
    const state = page.getByRole('dialog', { name: 'State' })
    await state.getByRole('spinbutton', { name: 'Recursion limit' }).fill('40')
    await state.getByRole('button', { name: 'Done' }).click()

    await page.getByRole('button', { name: 'LangGraph JSON' }).click()
    const json = page.getByRole('textbox', { name: 'LangGraph JSON' })
    await expect(json).toHaveValue(/"pause": "after"/)
    await expect(json).toHaveValue(/"recursionLimit": 40/)
  })

  test('a paused tool call: edit the arguments, then send the decision', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--awaiting-approval')
    const dialog = page.getByRole('dialog', { name: 'Approval needed' })
    await expect(dialog).toContainText('send_email')
    await dialog.getByRole('radio', { name: 'Edit' }).check()
    const args = dialog.getByRole('textbox', { name: 'Arguments (JSON)' })
    await args.fill('not json')
    await dialog.getByRole('button', { name: 'Send' }).click()
    await expect(dialog.getByRole('alert')).toContainText('JSON object')
    await expect(args).toBeFocused()
    await args.fill('{ "to": "me@example.com" }')
    await dialog.getByRole('button', { name: 'Send' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('output')).toContainText(
      '"type":"edit","edited_action":{"name":"send_email","args":{"to":"me@example.com"}}',
    )
    await expect(page.getByRole('button', { name: 'Review', exact: true })).toHaveCount(0)
  })

  test('“Later” closes the review; Review opens it again', async ({ page }) => {
    await open(page, 'blocks-ai-agent-builder--human-review')
    const dialog = page.getByRole('dialog', { name: 'Approval needed' })
    await expect(dialog).toContainText('Publish this brief?')
    await expect(dialog.getByRole('button', { name: 'Send' })).toBeDisabled()
    await dialog.getByRole('button', { name: 'Later' }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByRole('button', { name: 'Review', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Approve' })).toBeVisible()
  })
})
