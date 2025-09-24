import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js globals
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'off', // handled by TS
      'prefer-const': 'error',
      'no-console': 'error',

      // 🚫 Prevent using `any`
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
    ignores: ['dist', 'node_modules'],
  },
];
