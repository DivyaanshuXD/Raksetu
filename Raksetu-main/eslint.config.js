import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Variable handling
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_'
      }],
      
      // React specific
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Console statement prevention
      'no-console': ['warn', { 
        allow: ['warn', 'error'] // Only allow console.warn and console.error temporarily
      }],
      
      // Code quality
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error', // Enforce let/const
      'prefer-const': 'warn',
      'eqeqeq': ['warn', 'always'], // Enforce === instead of ==
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
]
