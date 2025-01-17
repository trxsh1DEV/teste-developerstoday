import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import * as tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
// import prettier from 'eslint-config-prettier';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config({
    extends: [
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
    ],
  }),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      semi: ['error', 'always'], // Força o uso de ponto e vírgula
      'no-unused-vars': 'error', // Alerta sobre variáveis não utilizadas
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'import/no-cycle': 'off',
      camelcase: 'off',
      'jsx-a11y/heading-has-content': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/iframe-has-title': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
