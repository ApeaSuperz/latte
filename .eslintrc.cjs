module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint-config-prettier',
    'eslint:recommended',
    'plugin:you-dont-need-lodash-underscore/compatible',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint'],
  globals: {
    AMap: 'readonly',
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '.*', args: 'none' }],
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
