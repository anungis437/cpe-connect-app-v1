module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'testing-library',
    'jest-dom',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    
    // React specific rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Testing rules
    'testing-library/await-async-query': 'error',
    'testing-library/no-await-sync-query': 'error',
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-dom-import': 'error',
    'jest-dom/prefer-checked': 'error',
    'jest-dom/prefer-enabled-disabled': 'error',
    'jest-dom/prefer-required': 'error',
    'jest-dom/prefer-to-have-attribute': 'error',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      // Test files
      files: [
        '**/__tests__/**/*.{js,jsx,ts,tsx}',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      // E2E test files
      files: ['e2e/**/*.{js,ts}'],
      extends: ['plugin:playwright/recommended'],
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      // Configuration files
      files: [
        '*.config.{js,ts}',
        '*.setup.{js,ts}',
        'middleware.ts',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.next/',
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'playwright-report/',
    '*.config.js',
    'supabase/migrations/',
  ],
}