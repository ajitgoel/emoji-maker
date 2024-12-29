module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    'no-mixed-spaces-and-tabs': 'off',
    'no-require-imports': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};