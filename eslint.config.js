import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import nPlugin from 'eslint-plugin-n'
import promisePlugin from 'eslint-plugin-promise'
import securityPlugin from 'eslint-plugin-security'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import unicornPlugin from 'eslint-plugin-unicorn'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'node_modules', 'build', '.amplify', '*.config.js'] },
  
  // Base JavaScript/TypeScript files (excluding amplify)
  {
    files: ['**/*.{js,jsx,ts,tsx}', '!amplify/**'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      import: importPlugin,
      n: nPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...reactHooks.configs.flat.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      ...importPlugin.configs.recommended.rules,
      ...(importPlugin.configs.typescript?.rules || {}),
      ...promisePlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      ...unicornPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-commented-code': 'warn',
      'unicorn/filename-case': [
        'warn',
        {
          case: 'camelCase',
          ignore: [/^[A-Z][a-zA-Z0-9]*\.(ts|tsx|js|jsx)$/],
        },
      ],
      ...prettierConfig.rules,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
  
  // Amplify backend files (exclude React/TSX plugins)
  {
    files: ['amplify/**/*.{js,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
      n: nPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...importPlugin.configs.recommended.rules,
      ...(importPlugin.configs.typescript?.rules || {}),
      ...promisePlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      ...unicornPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'sonarjs/todo-tag': 'warn',
      'sonarjs/no-commented-code': 'warn',
      'unicorn/filename-case': [
        'warn',
        {
          case: 'kebabCase',
          ignore: [/^[a-z]+(_[a-z]+)*\.(ts|js)$/],
        },
      ],
      ...prettierConfig.rules,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
      'import/extensions': ['.js', '.ts'],
    },
  },
]
