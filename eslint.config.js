import { defineConfig } from 'eslint'

export default defineConfig({
  files: ['**/*.{js,jsx,vue}'],
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  }
})
