// Code quality for the library, stories, tests, build scripts and the starter. Formatting is
// Prettier's job: eslint-config-prettier (last) turns off every rule that would fight it.
import eslintReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores([
    'dist/',
    'coverage/',
    'storybook-static/',
    'public/',
    'playwright-report/',
    'test-results/',
    'build/lib/',
    'preview/',
    'templates/',
    'brand/',
    'starter/dist/',
    'starter/src/routeTree.gen.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.tsx', '**/*.ts'],
    extends: [
      reactHooks.configs.flat.recommended,
      eslintReact.configs['recommended-type-checked'],
      jsxA11y.flatConfigs.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      // @eslint-react 5 ships its own copies of the React Compiler rules; react-hooks is the
      // reference implementation, so it reports them and these copies stay off (no duplicates).
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/globals': 'off',
      '@eslint-react/immutability': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/refs': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      // Numbers in template literals are fine (`${count} items`); objects and undefined are not.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // `onClick={() => setOpen(true)}` returns the setter's void: the usual React shorthand.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      // Async event handlers on JSX attributes are fine; promises elsewhere must be handled.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    // shadcn components export their cva variants and helpers next to the component
    // (buttonVariants, useFormField, formatBytes…). Moving them out to please Fast Refresh would
    // break the API every shadcn user knows, and this rule is only about dev-time HMR: off here.
    files: ['src/components/**/*.tsx', 'starter/src/components/**/*.tsx', 'src/lib/**/*.tsx', 'starter/src/lib/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Ref names: shadcn and our components name refs after what they hold (`panel`, `input`), not
    // with a `Ref` suffix; renaming them all is churn without a bug behind it.
    files: ['**/*.tsx', '**/*.ts'],
    rules: { '@eslint-react/naming-convention-ref-name': 'off' },
  },
  {
    // shadcn's components use useContext and <Context.Provider>, as upstream does; keeping them as
    // they are makes upstream fixes easy to port. Our own code uses React 19's use() and <Context>.
    files: ['src/components/ui/**/*.tsx', 'starter/src/components/ui/**/*.tsx'],
    ignores: ['**/markdown.tsx'],
    rules: { '@eslint-react/no-use-context': 'off', '@eslint-react/no-context-provider': 'off' },
  },
  {
    // Components open popovers, dialogs and inline editors with focus in their first field, on
    // purpose and covered by the interaction tests (focus never lands on <body>).
    files: ['src/components/**/*.tsx', 'starter/src/components/**/*.tsx'],
    rules: { 'jsx-a11y/no-autofocus': 'off' },
  },
  {
    // Stories: CSF render functions are rendered as components (hooks are fine), handlers are
    // no-ops on purpose, and the module exports story objects, not components.
    files: ['stories/**/*.tsx', 'stories/**/*.ts', '.storybook/**/*.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-refresh/only-export-components': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
    },
  },
  {
    // Tests assert on what they just set up: a non-null assertion is the check.
    files: ['tests/**/*.ts', 'unit/**/*.ts'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  {
    // Named exports only in the library: what `shadcn add` installs is imported by name.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.config.*', '**/*.stories.*'],
    rules: {
      'no-restricted-exports': ['error', { restrictDefaultExports: { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true } }],
    },
  },
  {
    // Node: build scripts, test runners and config files
    files: ['build/**/*.mjs', 'tests/**/*.{ts,mjs}', 'unit/**/*.ts', '*.{mjs,ts}', 'starter/*.ts', '.storybook/main.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Scripts that run in the design system's page, not in Node
    files: ['build/jsx-runtime-shim.js', 'build/lib-react.js', 'build/lib-react-dom.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    // Plain JavaScript has no types to check.
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier
)
