const { defineConfig } = require('eslint/config')
const js = require('@eslint/js')
const eslintConfigPrettier = require('eslint-config-prettier')
const globals = require('globals')

// const react = require('eslint-plugin-react')
// const reactHooks = require('eslint-plugin-react-hooks')

module.exports = defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  eslintConfigPrettier,

  // {
  //   files: ['**/*.{js,jsx}'],
  //   plugins: {
  //     react,
  //     'react-hooks': reactHooks,
  //   },
  //   languageOptions: {
  //     parserOptions: {
  //       ecmaFeatures: {
  //         jsx: true,
  //       },
  //     },
  //   },
  //   rules: {
  //     ...react.configs.recommended.rules,
  //     ...reactHooks.configs.recommended.rules,
  //   },
  //   settings: {
  //     react: {
  //       version: 'detect',
  //     },
  //   },
  // },
])