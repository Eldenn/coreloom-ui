import { create } from 'storybook/theming'

import { brandImage } from './brand'

/** Storybook's own UI (sidebar, toolbar, docs pages) in the Coreloom dark palette. */
export const coreloomTheme = create({
  base: 'dark',
  brandTitle: 'Coreloom UI',
  brandImage,
  brandUrl: 'https://github.com/Eldenn/coreloom-ui',
  colorPrimary: '#1ce0d3',
  colorSecondary: '#14b5ab',
  appBg: '#0d0f13',
  appContentBg: '#15171c',
  appPreviewBg: '#15171c',
  appBorderColor: '#303540',
  barBg: '#15171c',
  textColor: '#e6e8ec',
  textMutedColor: '#9ca3b1',
  inputBg: '#0a0b0e',
  inputBorder: '#303540',
  fontBase: "'Geist', ui-sans-serif, system-ui, sans-serif",
  fontCode: "'JetBrains Mono', ui-monospace, monospace",
})
