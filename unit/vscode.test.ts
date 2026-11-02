import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as VsCodeLib from '@/lib/vscode'

import { isExtensionMessage, isWebviewMessage } from '../examples/vscode-webview/src/messages'

type VsCodeModule = typeof VsCodeLib

/** A stand-in for <body>: only what readVsCodeTheme reads. */
function body(kind?: string, classes: string[] = []) {
  return {
    dataset: kind ? { vscodeThemeKind: kind } : {},
    classList: { contains: (c: string) => classes.includes(c) },
  } as unknown as HTMLElement
}

/** A stand-in for <html>: only its dataset. */
function root() {
  return { dataset: {} } as unknown as HTMLElement
}

// The module caches acquireVsCodeApi() (VS Code allows one call), so each test loads a fresh copy.
async function load(): Promise<VsCodeModule> {
  vi.resetModules()
  return import('@/lib/vscode')
}

afterEach(() => {
  delete (globalThis as { acquireVsCodeApi?: unknown }).acquireVsCodeApi
})

describe('readVsCodeTheme', () => {
  let vscode: VsCodeModule
  beforeEach(async () => {
    vscode = await load()
  })

  it('reads the theme kind attribute', () => {
    expect(vscode.readVsCodeTheme(body('vscode-dark'))).toBe('dark')
    expect(vscode.readVsCodeTheme(body('vscode-light'))).toBe('light')
    expect(vscode.readVsCodeTheme(body('vscode-high-contrast'))).toBe('high-contrast')
    expect(vscode.readVsCodeTheme(body('vscode-high-contrast-light'))).toBe('high-contrast-light')
  })

  it('falls back to the body classes, high contrast light first', () => {
    expect(vscode.readVsCodeTheme(body(undefined, ['vscode-light']))).toBe('light')
    expect(
      vscode.readVsCodeTheme(
        body(undefined, ['vscode-high-contrast', 'vscode-high-contrast-light']),
      ),
    ).toBe('high-contrast-light')
    expect(vscode.readVsCodeTheme(body(undefined, ['vscode-high-contrast']))).toBe('high-contrast')
  })

  it('returns null outside VS Code or for an unknown kind', () => {
    expect(vscode.readVsCodeTheme(body())).toBeNull()
    expect(vscode.readVsCodeTheme(body('vscode-sepia'))).toBeNull()
    expect(vscode.readVsCodeTheme(null)).toBeNull()
  })
})

describe('applyVsCodeTheme', () => {
  it('sets data-vscode, and data-theme="light" for the light kinds only', async () => {
    const vscode = await load()
    const html = root()
    vscode.applyVsCodeTheme('high-contrast-light', html)
    expect(html.dataset).toEqual({ vscode: 'high-contrast-light', theme: 'light' })
    vscode.applyVsCodeTheme('dark', html)
    expect(html.dataset).toEqual({ vscode: 'dark' })
    vscode.applyVsCodeTheme('light', html)
    expect(html.dataset).toEqual({ vscode: 'light', theme: 'light' })
    vscode.applyVsCodeTheme('high-contrast', html)
    expect(html.dataset).toEqual({ vscode: 'high-contrast' })
  })
})

describe('getVsCodeApi and postToExtension', () => {
  it('are no-ops outside VS Code', async () => {
    const vscode = await load()
    expect(vscode.getVsCodeApi()).toBeNull()
    expect(vscode.isVsCodeWebview()).toBe(false)
    expect(vscode.postToExtension({ type: 'ready' })).toBe(false)
  })

  it('acquire the API once and post through it', async () => {
    const api = { postMessage: vi.fn(), getState: vi.fn(), setState: vi.fn() }
    const acquire = vi.fn(() => api)
    Object.assign(globalThis, { acquireVsCodeApi: acquire })
    const vscode = await load()
    expect(vscode.getVsCodeApi()).toBe(api)
    expect(vscode.getVsCodeApi()).toBe(api)
    const message = { type: 'find', pattern: '*.ts' }
    expect(vscode.postToExtension(message)).toBe(true)
    expect(acquire).toHaveBeenCalledTimes(1)
    expect(api.postMessage).toHaveBeenCalledWith(message)
  })
})

describe('example message guards', () => {
  it('accept well-formed messages', () => {
    expect(isExtensionMessage({ type: 'active-file', path: null })).toBe(true)
    expect(
      isExtensionMessage({ type: 'found', pattern: '*', files: ['a.ts'], truncated: false }),
    ).toBe(true)
    expect(isWebviewMessage({ type: 'find', pattern: '*', skipNodeModules: true })).toBe(true)
    expect(isWebviewMessage({ type: 'open-file', path: 'src/a.ts' })).toBe(true)
  })

  it('reject anything else posted to the window', () => {
    expect(isExtensionMessage(null)).toBe(false)
    expect(isExtensionMessage('found')).toBe(false)
    expect(isExtensionMessage({ type: 'found', pattern: '*', files: [1], truncated: false })).toBe(
      false,
    )
    expect(isExtensionMessage({ type: 'active-file', path: 3 })).toBe(false)
    expect(isWebviewMessage({ type: 'find', pattern: '*' })).toBe(false)
    expect(isWebviewMessage({ type: 'open-file', path: { toString: () => 'x' } })).toBe(false)
    expect(isWebviewMessage({ type: 'delete-everything' })).toBe(false)
  })
})
