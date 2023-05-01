module.exports = {
  'env': {
    'browser': true,
    'node': true,
  },
  'extends': [
    'eslint-config-prettier',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  'overrides': [],
  'parser': 'vue-eslint-parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
    'parser': '@typescript-eslint/parser',
  },
  'plugins': [
    'vue',
    '@typescript-eslint'
  ],
  'globals': {
    'AMap': 'readonly',
  },
  'rules': {
    'no-console': process.env.NODE_ENV === 'production' ? ['error', {allow: ['error', 'warn']}] : 'off', //生产模式不允许使用log
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off', //生产默认不允许使用debugger
    '@typescript-eslint/no-unused-vars': ['error', {varsIgnorePattern: '.*', args: 'none'}], //变量声明未使用
    '@typescript-eslint/no-explicit-any': 'off', // 允许ts使用any
  },
}
