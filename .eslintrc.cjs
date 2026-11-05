module.exports = {
  root: true,
  ignorePatterns: ['dist/', 'node_modules/'],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      env: {
        browser: true,
        node: true,
        es2022: true
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
      ],
      rules: {
        complexity: ['error', 10],
        'max-depth': ['error', 3],
        '@typescript-eslint/no-explicit-any': 'error'
      }
    }
  ]
};
